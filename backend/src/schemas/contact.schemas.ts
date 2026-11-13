import { z } from 'zod';

export const CONTACT_SORTS = ['name', 'createdAt'] as const;
export type ContactSort = (typeof CONTACT_SORTS)[number];
export type SortOrder = 'asc' | 'desc';

// Query values arrive as strings, so numbers are coerced. A repeated param (?page=1&page=2)
// arrives as an array, coerces to NaN and is rejected. .strict() rejects unknown params,
// so typos like ?sortt=name fail loudly instead of being ignored.
export const listContactsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sort: z.enum(CONTACT_SORTS).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
