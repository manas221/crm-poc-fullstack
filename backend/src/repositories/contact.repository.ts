import { sql, type Expression, type ExpressionBuilder, type Kysely, type RawBuilder, type Selectable, type SqlBool } from 'kysely';
import { db } from '../db/client.js';
import type { ContactsTable, Database } from '../db/types.js';
import type { ContactSort, SortOrder } from '../schemas/contact.schemas.js';
import { escapeLike } from '../utils/like.js';

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

export interface ContactFilters {
  q?: string;
  company?: string;
  tagIds?: number[];
}

export interface FindPageOptions {
  filters: ContactFilters;
  sort: ContactSort;
  order: SortOrder;
  limit: number;
  offset: number;
}

// Only text made of phone characters is also searched as a phone number. Otherwise a stray
// digit ("asha2") would match every contact whose phone contains a 2.
const PHONE_LIKE = /^[+\d\s().-]+$/;

/**
 * Name, email and phone search. Each ILIKE/LIKE has a trigram index (§5), so Postgres can
 * combine them with a BitmapOr. phone_digits holds only digits, so "+91 98765" and
 * "(987) 65" both match "+91 98765 43210".
 */
function searchCondition(eb: ExpressionBuilder<Database, 'contacts'>, q: string): Expression<SqlBool> {
  const pattern = `%${escapeLike(q)}%`;
  const conditions = [eb('fullName', 'ilike', pattern), eb('email', 'ilike', pattern)];
  const digits = q.replace(/\D/g, '');
  if (PHONE_LIKE.test(q) && digits.length >= 2) {
    conditions.push(eb('phoneDigits', 'like', `%${digits}%`));
  }
  return eb.or(conditions);
}

/** One WHERE builder shared by the page query and the count, so total always matches data. */
function matchesFilters({ q, company, tagIds }: ContactFilters) {
  return (eb: ExpressionBuilder<Database, 'contacts'>): Expression<SqlBool> => {
    const conditions: Expression<SqlBool>[] = [];
    if (q) {
      conditions.push(searchCondition(eb, q));
    }
    if (company) {
      // Exact match ignoring case; lower(company) is what contacts_company indexes.
      conditions.push(eb(sql`lower(company)`, '=', sql`lower(${company})`));
    }
    if (tagIds && tagIds.length > 0) {
      // Has ANY of the tags. EXISTS rather than a JOIN, so a contact with two matching
      // tags still appears once and LIMIT/OFFSET stay correct.
      conditions.push(
        eb.exists(
          eb
            .selectFrom('contactTags as ct')
            .select(eb.lit(1).as('one'))
            .whereRef('ct.contactId', '=', 'contacts.id')
            .where('ct.tagId', 'in', tagIds),
        ),
      );
    }
    return eb.and(conditions); // no filters → 1 = 1
  };
}

export async function findPage({ filters, sort, order, limit, offset }: FindPageOptions): Promise<ContactRow[]> {
  let query = db.selectFrom('contacts').select(CONTACT_COLUMNS).where(matchesFilters(filters));
  // Every key uses the same direction, so Postgres can scan the index backwards for desc.
  for (const column of SORT_COLUMNS[sort]) {
    query = query.orderBy(column, order);
  }
  return query.limit(limit).offset(offset).execute();
}

export async function count(filters: ContactFilters): Promise<number> {
  const { total } = await db
    .selectFrom('contacts')
    .select((eb) => eb.fn.countAll<number>().as('total'))
    .where(matchesFilters(filters))
    .executeTakeFirstOrThrow();
  return total;
}

export async function findById(id: number): Promise<ContactRow | undefined> {
  return db.selectFrom('contacts').select(CONTACT_COLUMNS).where('id', '=', id).executeTakeFirst();
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

/** Which of these ids exist. Takes the executor so it can run inside a transaction. */
export async function findExistingIds(ids: readonly number[], executor: Kysely<Database> = db): Promise<number[]> {
  const rows = await executor
    .selectFrom('contacts')
    .select('id')
    .where('id', '=', sql<number>`any(${ids}::bigint[])`)
    .execute();
  return rows.map((r) => r.id);
}

/** Tag changes set updated_at but not version (CLAUDE.md §7: no false edit conflicts). */
export async function touch(ids: readonly number[], executor: Kysely<Database> = db): Promise<void> {
  await executor
    .updateTable('contacts')
    .set({ updatedAt: sql`now()` })
    .where('id', '=', sql<number>`any(${ids}::bigint[])`)
    .execute();
}
