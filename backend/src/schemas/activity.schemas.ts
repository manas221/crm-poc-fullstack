import { z } from 'zod';

export const DEFAULT_ACTIVITY_LIMIT = 20;
export const MAX_ACTIVITY_LIMIT = 50;

// GET /api/contacts/:id/activities. "Recent activity" only: the newest `limit` entries, no
// paging (README: a `before` cursor on (created_at, id) if older history were needed).
export const listActivitiesQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(MAX_ACTIVITY_LIMIT).default(DEFAULT_ACTIVITY_LIMIT),
  })
  .strict();

export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
