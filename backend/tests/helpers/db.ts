import { sql, type Insertable } from 'kysely';
import { db } from '../../src/db/client.js';
import type { ContactsTable } from '../../src/db/types.js';

/** Empties every table and restarts identities, so each test file starts from a known state. */
export async function resetDatabase(): Promise<void> {
  await sql`TRUNCATE contact_activities, contact_tags, tags, contacts RESTART IDENTITY CASCADE`.execute(db);
}

export async function insertTag(name: string): Promise<number> {
  const { id } = await db.insertInto('tags').values({ name }).returning('id').executeTakeFirstOrThrow();
  return id;
}

/** Inserts one contact (one statement per row, so ids follow call order) and returns its id. */
export async function insertContact(
  contact: Partial<Insertable<ContactsTable>> & Pick<Insertable<ContactsTable>, 'firstName' | 'lastName'>,
  tagIds: number[] = [],
): Promise<number> {
  const { id } = await db
    .insertInto('contacts')
    .values({ email: null, phone: null, company: null, ...contact })
    .returning('id')
    .executeTakeFirstOrThrow();

  if (tagIds.length > 0) {
    await db
      .insertInto('contactTags')
      .values(tagIds.map((tagId) => ({ contactId: id, tagId })))
      .execute();
  }
  return id;
}
