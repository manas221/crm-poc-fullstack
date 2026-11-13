// Runs once in the main Vitest process, before any test file.
export async function setup(): Promise<void> {
  // Must be set before config.ts is first imported, so the client targets contacts_test.
  process.env.NODE_ENV = 'test';
  const { db } = await import('../src/db/client.js');
  const { migrateToLatest } = await import('../src/db/migrate.js');
  try {
    await migrateToLatest(db);
  } finally {
    await db.destroy();
  }
}
