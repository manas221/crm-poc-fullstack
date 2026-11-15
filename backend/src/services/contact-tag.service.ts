import { db } from '../db/client.js';
import { notFound } from '../errors/app-error.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as contactTagRepository from '../repositories/contact-tag.repository.js';
import * as contactRepository from '../repositories/contact.repository.js';
import * as tagRepository from '../repositories/tag.repository.js';
import type { BulkAssignTagBody } from '../schemas/contact-tag.schemas.js';
import * as contactService from './contact.service.js';
import type { ContactWithTags } from './contact.service.js';

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

/**
 * Adds a tag to one contact (CLAUDE.md §7: a set operation, safe to repeat). TAG_ADDED and
 * the updated_at bump happen only if the link is new; version never changes, so an edit
 * someone has open doesn't get a false conflict. Returns the contact with its tags.
 */
export async function addTag(contactId: number, tagId: number): Promise<ContactWithTags> {
  await db.transaction().execute(async (trx) => {
    if (!(await contactRepository.findById(contactId, trx))) {
      throw notFound('Contact not found', { contactId });
    }
    const tag = await tagRepository.findById(tagId, trx);
    if (!tag) {
      throw notFound(`Tag ${tagId} not found`, { tagId });
    }

    if (await contactTagRepository.insertOne(contactId, tagId, trx)) {
      await activityRepository.insertMany(
        [{ contactId, type: 'TAG_ADDED', payload: { tagId, tagName: tag.name } }],
        trx,
      );
      await contactRepository.touch([contactId], trx);
    }
  });
  return contactService.getContact(contactId);
}

/**
 * Removes a tag from one contact, the same way: TAG_REMOVED and updated_at only if a link was
 * actually deleted. Removing a tag the contact doesn't have, or one that doesn't exist, is a
 * no-op rather than an error: either way the contact ends up without it.
 */
export async function removeTag(contactId: number, tagId: number): Promise<ContactWithTags> {
  await db.transaction().execute(async (trx) => {
    if (!(await contactRepository.findById(contactId, trx))) {
      throw notFound('Contact not found', { contactId });
    }
    // Read before deleting: the activity keeps the tag's name. No tag means no link either.
    const tag = await tagRepository.findById(tagId, trx);

    if (tag && (await contactTagRepository.deleteOne(contactId, tagId, trx))) {
      await activityRepository.insertMany(
        [{ contactId, type: 'TAG_REMOVED', payload: { tagId, tagName: tag.name } }],
        trx,
      );
      await contactRepository.touch([contactId], trx);
    }
  });
  return contactService.getContact(contactId);
}
