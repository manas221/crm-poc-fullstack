import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Test files share one real Postgres database and truncate it, so run them one at a time.
    fileParallelism: false,
    passWithNoTests: true,
  },
});
