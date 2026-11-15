import type { ContactSort, SortOrder } from '../../types/api.ts';
import type { ContactTableColumnKey } from './contactsListView.types.ts';

/** Sort values the API accepts (mirror the backend allowlist in contact.schemas.ts). */
export const CONTACT_SORT_KEYS = {
  NAME: 'name',
  CREATED_AT: 'createdAt',
} as const satisfies Record<string, ContactSort>;

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const satisfies Record<string, SortOrder>;

export const CONTACT_SORTS: readonly ContactSort[] = Object.values(CONTACT_SORT_KEYS);
export const SORT_ORDERS: readonly SortOrder[] = Object.values(SORT_ORDER);
export const DEFAULT_SORT: ContactSort = CONTACT_SORT_KEYS.CREATED_AT;
export const DEFAULT_ORDER: SortOrder = SORT_ORDER.DESC;

/** Action types for the list view's URL params reducer (listParamsReducer in hooks/useListParams.ts). */
export const LIST_VIEW_ACTION_TYPES = {
  SEARCH: 'search',
  SORT: 'sort',
  CLEAR_FILTERS: 'clearFilters',
  PAGE: 'page',
  LIMIT: 'limit',
} as const;

/**
 * Status of a data-driven part of the view (table, pagination footer), built by
 * useContactsListView from the query state. Each part's data type is a union on `status`.
 */
export const LIST_VIEW_STATUS = {
  LOADING: 'loading',
  ERROR: 'error',
  EMPTY: 'empty',
  READY: 'ready',
} as const;

/**
 * Direction a column starts in when you switch to it: names A→Z, dates newest first.
 * Clicking the column again flips it.
 */
export const INITIAL_SORT_ORDER: Record<ContactSort, SortOrder> = {
  [CONTACT_SORT_KEYS.NAME]: SORT_ORDER.ASC,
  [CONTACT_SORT_KEYS.CREATED_AT]: SORT_ORDER.DESC,
};

/** User-facing text of the list view, in one place. */
export const LIST_VIEW_TEXT = {
  TITLE: 'Contacts',
  TOTAL_CONTACTS: (formattedCount: string) => `${formattedCount} contacts`,
  SEARCH: {
    PLACEHOLDER: 'Search name, email or phone...',
    ARIA_LABEL: 'Search contacts by name, email or phone',
    TOO_SHORT: (minLength: number) => `Type at least ${minLength} characters to search`,
  },
  NO_RESULTS: {
    TITLE: 'No contacts match your search',
    DESCRIPTION: 'Try a different search term or remove a filter.',
    CLEAR_FILTERS: 'Clear filters',
  },
  NO_CONTACTS: {
    TITLE: 'No contacts yet',
    DESCRIPTION: 'Contacts appear here once they are added.',
  },
  PAST_LAST_PAGE: {
    TITLE: 'This page doesn’t exist',
    DESCRIPTION: (formattedPageCount: string) => `This list only has ${formattedPageCount} pages.`,
    GO_TO_LAST_PAGE: 'Go to last page',
  },
  LOAD_ERROR: {
    MESSAGE: 'Couldn’t load contacts. Please try again.',
    RETRY: 'Retry',
  },
  TABLE: {
    LOADING: 'Loading contacts…',
    EMPTY_VALUE: 'None',
  },
  PAGINATION: {
    NAV_LABEL: 'Pagination',
    ROWS_PER_PAGE: 'Rows per page',
    SHOWING: (start: string, end: string, total: string) => `Showing ${start}–${end} of ${total}`,
    SHOWING_NONE: (total: string) => `Showing 0 of ${total}`,
    PAGE_OF: (page: string, pageCount: string) => `Page ${page} of ${pageCount}`,
    /** The list failed to load, so the numbers are unknown. */
    SHOWING_UNKNOWN: 'Showing — of —',
    PAGE_UNKNOWN: 'Page — of —',
    FIRST: 'First',
    PREVIOUS: 'Previous',
    NEXT: 'Next',
    LAST: 'Last',
    FIRST_ARIA_LABEL: 'First page',
    PREVIOUS_ARIA_LABEL: 'Previous page',
    NEXT_ARIA_LABEL: 'Next page',
    LAST_ARIA_LABEL: 'Last page',
  },
} as const;

/** Columns of the contacts table. Order and widths live in components/ContactsTable/columns.ts. */
export const CONTACT_TABLE_COLUMN_KEYS = {
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  COMPANY: 'company',
  TAGS: 'tags',
  CREATED_AT: 'createdAt',
} as const;

/** Header text per column. Typed as a Record, so adding a column without a label won't compile. */
export const CONTACT_TABLE_COLUMN_LABELS: Record<ContactTableColumnKey, string> = {
  [CONTACT_TABLE_COLUMN_KEYS.NAME]: 'Name',
  [CONTACT_TABLE_COLUMN_KEYS.EMAIL]: 'Email',
  [CONTACT_TABLE_COLUMN_KEYS.PHONE]: 'Phone',
  [CONTACT_TABLE_COLUMN_KEYS.COMPANY]: 'Company',
  [CONTACT_TABLE_COLUMN_KEYS.TAGS]: 'Tags',
  [CONTACT_TABLE_COLUMN_KEYS.CREATED_AT]: 'Created',
};
