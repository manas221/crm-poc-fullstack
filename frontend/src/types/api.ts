// Mirrors the backend contract (CLAUDE.md §6): backend/src/controllers/contact.dto.ts,
// backend/src/schemas/*.schemas.ts and the services' result types. Copied, not shared.

export interface Tag {
  id: number;
  name: string;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: Tag[];
  version: number;
  createdAt: string; // ISO 8601, UTC
  updatedAt: string;
}

export interface Company {
  name: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Envelope of the list endpoints that have no pagination (tags, companies). */
export interface DataResponse<T> {
  data: T[];
}

export interface ContactListResponse {
  data: Contact[];
  pagination: Pagination;
}

export type ContactSort = 'name' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface ListContactsParams {
  page: number;
  limit: number;
  /** Optional, like the backend: it defaults to createdAt / desc. */
  sort?: ContactSort;
  order?: SortOrder;
  q?: string;
  company?: string;
  tags?: number[];
}

export interface ListCompaniesParams {
  q?: string;
  limit?: number;
}

export interface BulkAssignTagRequest {
  contactIds: number[];
  tagId: number;
}

export interface BulkAssignTagResponse {
  tagId: number;
  requested: number;
  added: number;
}

/**
 * `details` of a 404 from POST /api/contacts/bulk/tags (contact-tag.service.ts): the tag is
 * missing, or some contacts are (then nothing was written).
 */
export interface BulkAssignTagNotFoundDetails {
  tagId?: number;
  missingContactIds?: number[];
}

/** The fields PATCH /api/contacts/:id can change. null clears a nullable field. */
export interface ContactFields {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}

/** Body of PATCH /api/contacts/:id: the version last read, plus at least one changed field. */
export type UpdateContactRequest = { version: number } & Partial<ContactFields>;

/** `details` of a 409 VERSION_CONFLICT: the contact as it is now (someone else saved it). */
export interface VersionConflictDetails {
  current: Contact;
}

/**
 * `details` of a 404 from the tag endpoints (contact-tag.service.ts): which one is missing,
 * the contact or the tag.
 */
export interface ContactTagNotFoundDetails {
  contactId?: number;
  tagId?: number;
}

/** `details` of a 400 VALIDATION_ERROR (zod's flattened errors). */
export interface ValidationErrorDetails {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}
