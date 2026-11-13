import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Kysely } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';

// Resolves to src/db/migrations under tsx and dist/db/migrations in the compiled build.
const migrationFolder = fileURLToPath(new URL('./migrations', import.meta.url));

/**
 * Applies all pending migrations. Exported so the test setup can migrate the test DB.
 * Takes Kysely<any> because that's what Migrator accepts: it must work with a Kysely
 * typed for any schema (Kysely<Database> isn't assignable to Kysely<unknown>).
 */
export async function migrateToLatest(db: Kysely<any>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder }),
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    const mark = result.status === 'Success' ? '✓' : result.status === 'Error' ? '✗' : '–';
    console.log(`${mark} ${result.migrationName} (${result.status})`);
  }
  if (results?.length === 0) {
    console.log('No pending migrations.');
  }
  if (error) {
    throw error;
  }
}

// CLI entry point: `npm run migrate` / `npm run migrate:dev`.
const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const { db } = await import('./client.js');
  try {
    await migrateToLatest(db);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}
