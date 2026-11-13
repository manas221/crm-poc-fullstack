import { sql, type RawBuilder, type Selectable } from 'kysely';
import { db } from '../db/client.js';
import type { ContactsTable } from '../db/types.js';
import type { ContactSort, SortOrder } from '../schemas/contact.schemas.js';

/** Contact columns the API exposes. full_name / phone_digits exist only for search. */
export type ContactRow = Omit<Selectable<ContactsTable>, 'fullName' | 'phoneDigits'>;

export interface TagRow {
  contactId: number;
  id: number;
  name: string;
}

const CONTACT_COLUMNS = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
  'company',
  'version',
  'createdAt',
  'updatedAt',
] as const;

// ORDER BY columns can't be bound as SQL parameters, so the sort key is mapped through this
// fixed allowlist; user input never reaches the SQL text. The expressions match the
// indexes exactly (contacts_name_sort, contacts_created_at_id), and id is always the
// last key so rows that tie keep a stable order across pages.
const SORT_COLUMNS: Record<ContactSort, readonly RawBuilder<unknown>[]> = {
  name: [sql`lower(first_name)`, sql`lower(last_name)`, sql`id`],
  createdAt: [sql`created_at`, sql`id`],
};

export interface FindPageOptions {
  sort: ContactSort;
  order: SortOrder;
  limit: number;
  offset: number;
}

export async function findPage({ sort, order, limit, offset }: FindPageOptions): Promise<ContactRow[]> {
  let query = db.selectFrom('contacts').select(CONTACT_COLUMNS);
  // Every key uses the same direction, so Postgres can scan the index backwards for desc.
  for (const column of SORT_COLUMNS[sort]) {
    query = query.orderBy(column, order);
  }
  return query.limit(limit).offset(offset).execute();
}

export async function count(): Promise<number> {
  const { total } = await db
    .selectFrom('contacts')
    .select((eb) => eb.fn.countAll<number>().as('total'))
    .executeTakeFirstOrThrow();
  return total;
}

/** Tags for a page of contacts in one query. Kept separate from the page query so a JOIN
 * can't multiply rows and break LIMIT/OFFSET. */
export async function findTagsByContactIds(contactIds: readonly number[]): Promise<TagRow[]> {
  if (contactIds.length === 0) {
    return [];
  }
  return db
    .selectFrom('contactTags as ct')
    .innerJoin('tags as t', 't.id', 'ct.tagId')
    .select(['ct.contactId', 't.id', 't.name'])
    .where('ct.contactId', '=', sql<number>`any(${contactIds}::bigint[])`)
    .orderBy('t.name')
    .execute();
}
