import type { Request, Response } from 'express';
import { listActivitiesQuerySchema } from '../schemas/activity.schemas.js';
import { contactIdParamsSchema } from '../schemas/contact.schemas.js';
import * as activityService from '../services/activity.service.js';
import { toActivityDto } from './activity.dto.js';

export async function listActivities(req: Request, res: Response): Promise<void> {
  const { id } = contactIdParamsSchema.parse(req.params);
  const { limit } = listActivitiesQuerySchema.parse(req.query);
  const activities = await activityService.listRecentActivities(id, limit);
  res.json({ data: activities.map(toActivityDto) });
}
