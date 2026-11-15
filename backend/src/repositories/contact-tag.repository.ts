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

/** Links one contact to one tag. False if the link already existed (nothing written). */
export async function insertOne(contactId: number, tagId: number, executor: Kysely<Database> = db): Promise<boolean> {
  const inserted = await insertIgnoringExisting([contactId], tagId, executor);
  return inserted.length > 0;
}

/** Unlinks one contact from one tag. False if there was no link (nothing deleted). */
export async function deleteOne(contactId: number, tagId: number, executor: Kysely<Database> = db): Promise<boolean> {
  const deleted = await executor
    .deleteFrom('contactTags')
    .where('contactId', '=', contactId)
    .where('tagId', '=', tagId)
    .returning('contactId')
    .execute();
  return deleted.length > 0;
}
