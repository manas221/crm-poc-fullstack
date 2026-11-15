import { sql, type Kysely, type Selectable } from 'kysely';
import { db } from '../db/client.js';
import type { Database, TagsTable } from '../db/types.js';

export type Tag = Pick<Selectable<TagsTable>, 'id' | 'name'>;

/** All tags, alphabetically. There are only a handful, so no paging or search. */
export async function findAll(): Promise<Tag[]> {
  return db.selectFrom('tags').select(['id', 'name']).orderBy(sql`lower(name)`).orderBy('id').execute();
}

export async function findById(id: number, executor: Kysely<Database> = db): Promise<Tag | undefined> {
  return executor.selectFrom('tags').select(['id', 'name']).where('id', '=', id).executeTakeFirst();
}
