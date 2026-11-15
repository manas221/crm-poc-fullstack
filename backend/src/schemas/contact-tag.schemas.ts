import { z } from 'zod';

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
