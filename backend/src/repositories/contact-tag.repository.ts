import type { Kysely } from 'kysely';
import { db } from '../db/client.js';
import type { Database } from '../db/types.js';

/**
 * Links each contact to the tag, skipping links that already exist. Returns only the
 * contact ids that were actually linked now: RETURNING leaves out rows skipped by
 * ON CONFLICT, even when another request inserts them at the same moment. That is what
 * keeps activity rows from being written twice.
 */
export async function insertIgnoringExisting(
  contactIds: readonly number[],
  tagId: number,
  executor: Kysely<Database> = db,
): Promise<number[]> {
  const rows = await executor
    .insertInto('contactTags')
    .values(contactIds.map((contactId) => ({ contactId, tagId })))
    .onConflict((oc) => oc.columns(['contactId', 'tagId']).doNothing())
    .returning('contactId')
    .execute();
  return rows.map((r) => r.contactId);
}
