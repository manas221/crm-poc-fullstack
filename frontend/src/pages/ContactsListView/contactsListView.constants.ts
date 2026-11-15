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
  COMPANY: 'company',
  TAGS: 'tags',
  PAGE: 'page',
  LIMIT: 'limit',
} as const;

/** Action types for the row selection reducer (rowSelectionReducer in hooks/useRowSelection.ts). */
export const ROW_SELECTION_ACTION_TYPES = {
  TOGGLE: 'toggle',
  SELECT_MANY: 'selectMany',
  CLEAR: 'clear',
} as const;

/** State of the last "Assign tag" request, as shown in the selection bar. */
export const BULK_ASSIGN_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
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

const contactsCount = (count: number) => `${count} ${count === 1 ? 'contact' : 'contacts'}`;

/** User-facing text of the list view, in one place. */
export const LIST_VIEW_TEXT = {
  TITLE: 'Contacts',
  TOTAL_CONTACTS: (formattedCount: string) => `${formattedCount} contacts`,
  SEARCH: {
    PLACEHOLDER: 'Search name, email or phone...',
    ARIA_LABEL: 'Search contacts by name, email or phone',
    TOO_SHORT: (minLength: number) => `Type at least ${minLength} characters to search`,
  },
  FILTERS: {
    CLEAR_FILTERS: 'Clear filters',
    COMPANY: {
      LABEL: 'Company',
      SEARCH_PLACEHOLDER: 'Search companies...',
      SEARCH_ARIA_LABEL: 'Search companies',
      LOADING: 'Loading companies…',
      ERROR: 'Couldn’t load companies.',
      RETRY: 'Retry',
      NO_MATCHES: (q: string) => `No companies match “${q}”`,
      NO_COMPANIES: 'No companies yet',
      MATCH_COUNT: (count: number) => (count === 1 ? '1 match' : `${count} matches`),
      /** The API returns at most COMPANY_SUGGESTION_LIMIT names, so there may be more. */
      FIRST_MATCHES: (count: number) => `First ${count} matches, keep typing to narrow down`,
    },
    TAGS: {
      LABEL: 'Tags',
      LOADING: 'Loading tags…',
      ERROR: 'Couldn’t load tags.',
      RETRY: 'Retry',
      NO_TAGS: 'No tags yet',
      /** Button value when more than one tag is picked: "VIP +2". */
      MORE: (firstName: string, moreCount: number) => `${firstName} +${moreCount}`,
    },
    CHIPS: {
      COMPANY: 'Company',
      TAG: 'Tag',
      REMOVE_ARIA_LABEL: (label: string, value: string) => `Remove filter ${label}: ${value}`,
    },
  },
  SELECTION: {
    SELECTED_COUNT: (formattedCount: string) => `${formattedCount} selected`,
    CLEAR_SELECTION: 'Clear selection',
    SELECT_ALL_ARIA_LABEL: 'Select all contacts on this page',
    SELECT_ROW_ARIA_LABEL: (name: string) => `Select ${name}`,
  },
  ASSIGN_TAG: {
    LABEL: 'Assign tag',
    MENU_TITLE: (count: number) => `Add a tag to ${contactsCount(count)}`,
    ASSIGNING: 'Assigning…',
    ADDED_ALL: (tagName: string, count: number) => `Added “${tagName}” to ${contactsCount(count)}.`,
    ADDED_SOME: (tagName: string, added: number, alreadyHad: number) =>
      `Added “${tagName}” to ${contactsCount(added)}. ${alreadyHad} already had it.`,
    ADDED_NONE: (tagName: string, count: number) =>
      count === 1 ? `This contact already has “${tagName}”.` : `All ${count} contacts already have “${tagName}”.`,
    /** Used if the tag isn't in the loaded tags list (shouldn't happen). */
    FALLBACK_TAG_NAME: 'the tag',
    TAG_NOT_FOUND: 'That tag no longer exists. Pick another one.',
    CONTACTS_NOT_FOUND: (count: number) =>
      `${contactsCount(count)} no longer ${count === 1 ? 'exists' : 'exist'}, so nothing was changed. The list has been refreshed.`,
    FAILED: 'Couldn’t assign the tag. Please try again.',
    RETRY: 'Try again',
    LOADING: 'Loading tags…',
    ERROR: 'Couldn’t load tags.',
    NO_TAGS: 'No tags yet',
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
    COPY_EMAIL: (email: string) => `Copy email ${email}`,
    COPY_PHONE: (phone: string) => `Copy phone ${phone}`,
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
  CHECKBOX: 'checkbox',
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  COMPANY: 'company',
  TAGS: 'tags',
  CREATED_AT: 'createdAt',
} as const;

/** Header text per column. Typed as a Record, so adding a column without a label won't compile. */
export const CONTACT_TABLE_COLUMN_LABELS: Record<ContactTableColumnKey, string> = {
  // The checkbox column has no visible header text; the select-all checkbox has its own label.
  [CONTACT_TABLE_COLUMN_KEYS.CHECKBOX]: 'Select',
  [CONTACT_TABLE_COLUMN_KEYS.NAME]: 'Name',
  [CONTACT_TABLE_COLUMN_KEYS.EMAIL]: 'Email',
  [CONTACT_TABLE_COLUMN_KEYS.PHONE]: 'Phone',
  [CONTACT_TABLE_COLUMN_KEYS.COMPANY]: 'Company',
  [CONTACT_TABLE_COLUMN_KEYS.TAGS]: 'Tags',
  [CONTACT_TABLE_COLUMN_KEYS.CREATED_AT]: 'Created',
};
