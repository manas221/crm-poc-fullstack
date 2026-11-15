import type { Request, Response } from 'express';
import { listTagsQuerySchema } from '../schemas/tag.schemas.js';
import * as tagService from '../services/tag.service.js';

export async function listTags(req: Request, res: Response): Promise<void> {
  listTagsQuerySchema.parse(req.query);
  const tags = await tagService.listTags();
  res.json({ data: tags });
}
