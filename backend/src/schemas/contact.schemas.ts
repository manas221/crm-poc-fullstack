import { z } from 'zod';

export const CONTACT_SORTS = ['name', 'createdAt'] as const;
export type ContactSort = (typeof CONTACT_SORTS)[number];
export type SortOrder = 'asc' | 'desc';

export const MAX_TAG_FILTER = 50;

// "?q=" or "?q=   " means no search. Inner whitespace is collapsed so "asha   verma" still
// matches the generated full_name "Asha Verma".
const searchTerm = z
  .string()
  .trim()
  .max(100)
  .transform((v) => v.replace(/\s+/g, ' ') || undefined)
  .refine((v) => v === undefined || v.length >= 2, 'Search must be at least 2 characters');

const companyName = z
  .string()
  .trim()
  .max(200)
  .transform((v) => v || undefined);

// "2,5" → [2, 5]. Strict per item ("2,,5", "abc", "0", "1.5" all fail) and deduplicated.
const tagIdList = z
  .string()
  .trim()
  .transform((v) => (v === '' ? [] : v.split(',').map((s) => s.trim())))
  .pipe(
    z
      .array(
        z
          .string()
          .regex(/^[1-9]\d*$/, 'Tag ids must be positive integers')
          .transform(Number)
          .pipe(z.number().int()),
      )
      .max(MAX_TAG_FILTER),
  )
  .transform((ids) => (ids.length > 0 ? [...new Set(ids)] : undefined));

// Query values arrive as strings, so numbers are coerced. A repeated param (?page=1&page=2)
// arrives as an array, which every field rejects. .strict() rejects unknown params, so
// typos like ?sortt=name fail loudly instead of being ignored.
export const listContactsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sort: z.enum(CONTACT_SORTS).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    q: searchTerm.optional(),
    company: companyName.optional(),
    tags: tagIdList.optional(),
  })
  .strict();

export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;

// /api/contacts/:id. Digits only, so "1e3", "0x10", "5.0" and " 5" are rejected rather than
// coerced into some other contact's id. Capped at the largest exact JS integer.
export const contactIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'Contact id must be a positive integer')
    .transform(Number)
    .pipe(z.number().int().max(Number.MAX_SAFE_INTEGER)),
});

export type ContactIdParams = z.infer<typeof contactIdParamsSchema>;

// PATCH /api/contacts/:id (CLAUDE.md §6). Strings are trimmed; for the nullable fields a blank
// string means "clear it" and is stored as NULL. Email is stored lowercased, matching the
// lower(email) unique index.
export const EDITABLE_CONTACT_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'company'] as const;
export type EditableContactField = (typeof EDITABLE_CONTACT_FIELDS)[number];

export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_COMPANY_LENGTH = 200;
export const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;

const blankToNull = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? null : value);

// Required: can be changed but not cleared, so null and "" are rejected.
const personName = z.string().trim().min(1, 'Required').max(MAX_NAME_LENGTH);

const email = z.preprocess(
  blankToNull,
  z.string().trim().toLowerCase().max(MAX_EMAIL_LENGTH).pipe(z.email('Invalid email address')).nullable(),
);

const phone = z.preprocess(
  blankToNull,
  z
    .string()
    .trim()
    .regex(PHONE_PATTERN, 'Phone may contain digits, spaces, ( ) and -, optionally starting with +, 7-20 characters')
    .nullable(),
);

const company = z.preprocess(blankToNull, z.string().trim().max(MAX_COMPANY_LENGTH).nullable());

// version is the one the client last read (optimistic locking, §7). JSON body, so it must be
// a real number. .strict() rejects unknown fields (e.g. a typo, or trying to set id/version).
export const updateContactBodySchema = z
  .object({
    version: z.number().int().positive(),
    firstName: personName.optional(),
    lastName: personName.optional(),
    email: email.optional(),
    phone: phone.optional(),
    company: company.optional(),
  })
  .strict()
  .refine(
    (body) => EDITABLE_CONTACT_FIELDS.some((field) => body[field] !== undefined),
    'At least one field to update is required',
  );

export type UpdateContactBody = z.infer<typeof updateContactBodySchema>;
