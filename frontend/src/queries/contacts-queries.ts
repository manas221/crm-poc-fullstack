import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listCompanies } from '../api/companies.ts';
import { bulkAssignTag, listContacts } from '../api/contacts.ts';
import { listTags } from '../api/tags.ts';
import { COMPANY_SUGGESTION_LIMIT } from '../constants/list.ts';
import type { BulkAssignTagRequest, ListCompaniesParams, ListContactsParams } from '../types/api.ts';

/**
 * Every React Query key in the app comes from here, so both pages share cached data (e.g.
 * tags) and invalidation is predictable. Keys are hierarchical: invalidating
 * `contacts.all` refreshes every contact list, the total and any contact detail.
 *
 * Params objects are part of the key, so they must be normalised before they get here
 * (e.g. tag ids sorted), or two equivalent filters would be cached twice.
 */
export const queryKeys = {
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (params: ListContactsParams) => [...queryKeys.contacts.lists(), params] as const,
    total: () => [...queryKeys.contacts.all, 'total'] as const,
    detail: (id: number) => [...queryKeys.contacts.all, 'detail', id] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  companies: {
    all: ['companies'] as const,
    search: (params: ListCompaniesParams) => [...queryKeys.companies.all, params] as const,
  },
};

// ---------------------------------------------------------------------------------------
// Contacts

/** True when two list requests differ only in page or page size, i.e. it's the same result set. */
function isSameResultSet(a: ListContactsParams, b: ListContactsParams): boolean {
  return (
    a.sort === b.sort &&
    a.order === b.order &&
    (a.q ?? '') === (b.q ?? '') &&
    (a.company ?? '') === (b.company ?? '') &&
    (a.tags ?? []).join(',') === (b.tags ?? []).join(',')
  );
}

export function useContactsQuery(params: ListContactsParams) {
  return useQuery({
    queryKey: queryKeys.contacts.list(params),
    queryFn: () => listContacts(params),
    // Paging keeps the current rows visible (dimmed) until the next page arrives. A new search,
    // filter or sort shows skeleton rows instead: the old rows would be misleading there.
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[2];
      return previousParams && isSameResultSet(previousParams, params) ? previousData : undefined;
    },
  });
}

/**
 * Total number of contacts, ignoring filters: the "50,000 contacts" next to the page title,
 * which stays the same while filters narrow the table. One row is the cheapest request
 * that returns the count.
 */
export function useContactsTotalQuery() {
  return useQuery({
    queryKey: queryKeys.contacts.total(),
    // Sort doesn't affect the count, so it's left to the backend default.
    queryFn: () => listContacts({ page: 1, limit: 1 }),
    select: (response) => response.pagination.total,
  });
}

export function useBulkAssignTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkAssignTagRequest) => bulkAssignTag(body),
    // Tags show in the list rows and on the detail page, so refresh everything contact-related.
    // On an error nothing was written (the backend uses one transaction), so nothing to refresh.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all }),
  });
}

// ---------------------------------------------------------------------------------------
// Tags

/** All tags, shared by the tags filter, the assign-tag menu and the detail page's tag picker. */
export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: listTags,
    // Tags only come from the seed (there is no endpoint to create them), so they rarely change.
    staleTime: 5 * 60_000,
  });
}

// ---------------------------------------------------------------------------------------
// Companies

/**
 * Company suggestions for the company filter. `q` should already be debounced by the caller.
 * `enabled` lets the dropdown fetch only once it is opened.
 */
export function useCompaniesQuery(q: string, { enabled = true }: { enabled?: boolean } = {}) {
  const params = { q: q.trim() || undefined, limit: COMPANY_SUGGESTION_LIMIT };
  return useQuery({
    queryKey: queryKeys.companies.search(params),
    queryFn: () => listCompanies(params),
    enabled,
    // Keep the previous suggestions visible while the next ones load, so the list doesn't flicker.
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
