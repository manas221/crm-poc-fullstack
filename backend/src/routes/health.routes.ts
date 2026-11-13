import { Router } from 'express';
import { pingDatabase } from '../repositories/health.repository.js';

export const healthRouter = Router();

// Used by Render's health check: a DB failure becomes a 500 via the error middleware,
// so a deploy that can't reach Postgres is marked unhealthy.
healthRouter.get('/health', async (_req, res) => {
  await pingDatabase();
  res.json({ status: 'ok' });
});
