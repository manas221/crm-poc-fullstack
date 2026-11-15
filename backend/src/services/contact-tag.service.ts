import { db } from '../db/client.js';
import { notFound } from '../errors/app-error.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as contactTagRepository from '../repositories/contact-tag.repository.js';
import * as contactRepository from '../repositories/contact.repository.js';
import * as tagRepository from '../repositories/tag.repository.js';
import type { BulkAssignTagBody } from '../schemas/contact-tag.schemas.js';

export interface BulkAssignResult {
  tagId: number;
  requested: number;
  added: number;
}

/**
 * Adds one tag to many contacts in a single transaction: either every contact exists and
 * the links, activity rows and updated_at all change together, or nothing changes.
 * Contacts that already have the tag are skipped and get no activity row. Like single tag
 * changes, this doesn't touch version (CLAUDE.md §7).
 */
export async function bulkAssignTag({ contactIds, tagId }: BulkAssignTagBody): Promise<BulkAssignResult> {
  return db.transaction().execute(async (trx) => {
    const tag = await tagRepository.findById(tagId, trx);
    if (!tag) {
      throw notFound(`Tag ${tagId} not found`, { tagId });
    }

    const existing = new Set(await contactRepository.findExistingIds(contactIds, trx));
    const missingContactIds = contactIds.filter((id) => !existing.has(id));
    if (missingContactIds.length > 0) {
      throw notFound(`${missingContactIds.length} contact(s) not found`, { missingContactIds });
    }

    // Inserting in id order means two overlapping bulk requests take their row locks in
    // the same order, so they queue behind each other instead of deadlocking.
    const sortedIds = [...contactIds].sort((a, b) => a - b);
    const addedIds = await contactTagRepository.insertIgnoringExisting(sortedIds, tagId, trx);

    if (addedIds.length > 0) {
      await activityRepository.insertMany(
        addedIds.map((contactId) => ({
          contactId,
          type: 'TAG_ADDED' as const,
          payload: { tagId, tagName: tag.name, bulk: true as const },
        })),
        trx,
      );
      await contactRepository.touch(addedIds, trx);
    }

    return { tagId, requested: contactIds.length, added: addedIds.length };
  });
}
