import type { Request, Response } from 'express';
import { bulkAssignTagBodySchema } from '../schemas/contact-tag.schemas.js';
import * as contactTagService from '../services/contact-tag.service.js';

export async function bulkAssignTag(req: Request, res: Response): Promise<void> {
  const body = bulkAssignTagBodySchema.parse(req.body);
  const result = await contactTagService.bulkAssignTag(body);
  res.json(result);
}
