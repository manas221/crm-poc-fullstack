import pg from 'pg';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { config } from '../config.js';
import type { Database } from './types.js';

// int8 (bigint) and COUNT(*) arrive as strings by default. Our IDs and counts stay far
// below 2^53, so parsing to number is safe and keeps the API types simple.
const INT8_OID = 20;
pg.types.setTypeParser(INT8_OID, (value) => Number(value));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  // Needed for Render's *external* URL (e.g. seeding from a laptop). Render's internal URL and
  // local Docker don't use SSL.
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});
