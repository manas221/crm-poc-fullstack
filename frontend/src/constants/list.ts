import type { ContactSort, SortOrder } from '../types/api.ts';

// Limits mirror backend/src/schemas/contact.schemas.ts and contact-tag.schemas.ts. The backend
// enforces them anyway; these keep the UI from sending requests that would get a 400.

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const CONTACT_SORTS: readonly ContactSort[] = ['name', 'createdAt'];
export const SORT_ORDERS: readonly SortOrder[] = ['asc', 'desc'];
export const DEFAULT_SORT: ContactSort = 'createdAt';
export const DEFAULT_ORDER: SortOrder = 'desc';

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 100;
export const SEARCH_DEBOUNCE_MS = 300;

export const MAX_COMPANY_LENGTH = 200;
export const MAX_TAG_FILTER = 50;
export const COMPANY_SUGGESTION_LIMIT = 20;

export const MAX_BULK_CONTACTS = 1000;
