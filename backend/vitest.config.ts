import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // config.ts switches to DATABASE_URL_TEST when NODE_ENV=test.
    env: { NODE_ENV: 'test' },
    // Migrates contacts_test once before the whole run.
    globalSetup: ['tests/global-setup.ts'],
    // Per test file: closes the DB pool when the file finishes.
    setupFiles: ['tests/setup.ts'],
    // Test files share one real Postgres database and truncate it, so run them one at a time.
    fileParallelism: false,
  },
});
