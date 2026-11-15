import type { ContactSort, SortOrder } from '../types/api.ts';

// Limits mirror backend/src/schemas/contact.schemas.ts and contact-tag.schemas.ts. The backend
// enforces them anyway; these keep the UI from sending requests that would get a 400.

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const DEFAULT_SORT: ContactSort = 'createdAt';
export const DEFAULT_ORDER: SortOrder = 'desc';

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 100;

export const COMPANY_SUGGESTION_LIMIT = 20;

export const MAX_BULK_CONTACTS = 1000;
