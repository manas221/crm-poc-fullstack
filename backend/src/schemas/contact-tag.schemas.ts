import { z } from 'zod';
import { pathId } from './contact.schemas.js';

export const MAX_BULK_CONTACTS = 1000;

const id = z.number().int().positive();

// JSON body, so ids must be real numbers ("5" is rejected). Duplicates are rejected rather
// than silently merged, so "requested" in the response always equals contactIds.length.
export const bulkAssignTagBodySchema = z
  .object({
    contactIds: z
      .array(id)
      .min(1)
      .max(MAX_BULK_CONTACTS)
      .refine((ids) => new Set(ids).size === ids.length, 'contactIds must not contain duplicates'),
    tagId: id,
  })
  .strict();

export type BulkAssignTagBody = z.infer<typeof bulkAssignTagBodySchema>;

// POST /api/contacts/:id/tags
export const addTagBodySchema = z.object({ tagId: id }).strict();

export type AddTagBody = z.infer<typeof addTagBodySchema>;

// DELETE /api/contacts/:id/tags/:tagId
export const contactTagParamsSchema = z.object({ id: pathId, tagId: pathId });

export type ContactTagParams = z.infer<typeof contactTagParamsSchema>;
