import type { Insertable, Kysely } from 'kysely';
import { db } from '../db/client.js';
import type { ContactActivitiesTable, Database } from '../db/types.js';

export type NewActivity = Insertable<ContactActivitiesTable>;

export async function insertMany(activities: readonly NewActivity[], executor: Kysely<Database> = db): Promise<void> {
  if (activities.length === 0) {
    return;
  }
  await executor.insertInto('contactActivities').values(activities).execute();
}
