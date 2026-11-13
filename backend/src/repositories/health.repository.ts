import { sql } from 'kysely';
import { db } from '../db/client.js';

/** Throws if the database is unreachable. */
export async function pingDatabase(): Promise<void> {
  await sql`SELECT 1`.execute(db);
}
