import type { Insertable, Kysely, Selectable } from 'kysely';
import { db } from '../db/client.js';
import type { ContactActivitiesTable, Database } from '../db/types.js';

export type NewActivity = Insertable<ContactActivitiesTable>;

export async function insertMany(activities: readonly NewActivity[], executor: Kysely<Database> = db): Promise<void> {
  if (activities.length === 0) {
    return;
  }
  await executor.insertInto('contactActivities').values(activities).execute();
}

export type ActivityRow = Selectable<ContactActivitiesTable>;

/**
 * A contact's newest activities. Uses contact_activities_contact_created (contact_id,
 * created_at DESC); id breaks ties, since rows written in one transaction share now().
 */
export async function findRecentByContactId(contactId: number, limit: number): Promise<ActivityRow[]> {
  return db
    .selectFrom('contactActivities')
    .select(['id', 'contactId', 'type', 'payload', 'createdAt'])
    .where('contactId', '=', contactId)
    .orderBy('createdAt', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
    .execute();
}
