import { afterAll } from 'vitest';
import { db } from '../src/db/client.js';

// Each test file runs in its own worker with its own pool; close it so the worker can exit.
afterAll(async () => {
  await db.destroy();
});
