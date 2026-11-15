import { z } from 'zod';

export const listCompaniesQuerySchema = z
  .object({
    // Optional: without it the endpoint returns the first companies alphabetically, which is
    // what a dropdown shows before the user types. "?q=" or "?q=  " counts as no query.
    q: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((v) => v || undefined),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
