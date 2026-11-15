import {
  DEFAULT_PAGE_SIZE,
  MAX_COMPANY_LENGTH,
  MAX_SEARCH_LENGTH,
  MAX_TAG_FILTER,
  MIN_SEARCH_LENGTH,
  PAGE_SIZE_OPTIONS,
} from '../../constants/list.ts';
import { CONTACT_SORTS, DEFAULT_ORDER, DEFAULT_SORT, SORT_ORDERS } from './contactsListView.constants.ts';
import type { ContactSort, SortOrder } from '../../types/api.ts';
import type { ListParams } from './contactsListView.types.ts';

// The list's search, filters, sort and page live only in the URL (CLAUDE.md §8). These pure
// functions turn the URL into params, apply user actions, and turn params back into a URL.

/**
 * Trims and collapses whitespace. Under the minimum length it counts as no search, which is
 * also what the backend would otherwise reject with a 400.
 */
export function normalizeSearch(raw: string): string {
  const q = raw.trim().replace(/\s+/g, ' ');
  return q.length >= MIN_SEARCH_LENGTH ? q : '';
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return undefined;
  }
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : undefined;
}

/** "5,2,x,5" → [2, 5]: invalid ids dropped, deduplicated, sorted (a stable cache key). */
function parseTagIds(value: string | null): number[] {
  const ids = (value ?? '').split(',').map((part) => parsePositiveInt(part.trim()));
  const valid = ids.filter((id): id is number => id !== undefined);
  return [...new Set(valid)].sort((a, b) => a - b).slice(0, MAX_TAG_FILTER);
}

function isOneOf<T extends string>(options: readonly T[], value: string | null): value is T {
  return value !== null && (options as readonly string[]).includes(value);
}

/**
 * Reads params from the URL. Anything invalid (a hand-edited or outdated link) falls back to
 * its default instead of failing, so the request built from it never gets a 400.
 */
export function parseListParams(searchParams: URLSearchParams): ListParams {
  const limit = parsePositiveInt(searchParams.get('limit'));
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');
  const q = normalizeSearch(searchParams.get('q') ?? '');
  const company = (searchParams.get('company') ?? '').trim();
  const tags = parseTagIds(searchParams.get('tags'));

  return {
    page: parsePositiveInt(searchParams.get('page')) ?? 1,
    limit: limit !== undefined && (PAGE_SIZE_OPTIONS as readonly number[]).includes(limit) ? limit : DEFAULT_PAGE_SIZE,
    sort: isOneOf<ContactSort>(CONTACT_SORTS, sort) ? sort : DEFAULT_SORT,
    order: isOneOf<SortOrder>(SORT_ORDERS, order) ? order : DEFAULT_ORDER,
    ...(q && q.length <= MAX_SEARCH_LENGTH && { q }),
    ...(company && company.length <= MAX_COMPANY_LENGTH && { company }),
    ...(tags.length > 0 && { tags }),
  };
}

/** Writes params back to the URL, leaving out defaults so URLs stay short and readable. */
export function toSearchParams(params: ListParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set('q', params.q);
  }

  if (params.company) {
    searchParams.set('company', params.company);
  }

  if (params.tags && params.tags.length > 0) {
    searchParams.set('tags', params.tags.join(','));
  }
  
  if (params.sort !== DEFAULT_SORT) {
    searchParams.set('sort', params.sort);
  }

  if (params.order !== DEFAULT_ORDER) {
    searchParams.set('order', params.order);
  }

  if (params.page !== 1) {
    searchParams.set('page', String(params.page));
  }

  if (params.limit !== DEFAULT_PAGE_SIZE) {
    searchParams.set('limit', String(params.limit));
  }
  return searchParams;
}

export function hasActiveFilters(params: ListParams): boolean {
  return Boolean(params.q || params.company || (params.tags && params.tags.length > 0));
}
