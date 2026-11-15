import type { Request, Response } from 'express';
import { contactIdParamsSchema } from '../schemas/contact.schemas.js';
import { addTagBodySchema, bulkAssignTagBodySchema, contactTagParamsSchema } from '../schemas/contact-tag.schemas.js';
import * as contactTagService from '../services/contact-tag.service.js';
import { toContactDto } from './contact.dto.js';

export async function bulkAssignTag(req: Request, res: Response): Promise<void> {
  const body = bulkAssignTagBodySchema.parse(req.body);
  const result = await contactTagService.bulkAssignTag(body);
  res.json(result);
}

/** 200 with the contact either way: the tag was added, or the contact already had it. */
export async function addTag(req: Request, res: Response): Promise<void> {
  const { id } = contactIdParamsSchema.parse(req.params);
  const { tagId } = addTagBodySchema.parse(req.body);
  res.json(toContactDto(await contactTagService.addTag(id, tagId)));
}

/** 200 with the contact either way: the tag was removed, or the contact didn't have it. */
export async function removeTag(req: Request, res: Response): Promise<void> {
  const { id, tagId } = contactTagParamsSchema.parse(req.params);
  res.json(toContactDto(await contactTagService.removeTag(id, tagId)));
}
