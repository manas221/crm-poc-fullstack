import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listCompanies } from '../api/companies.ts';
import { bulkAssignTag, getContact, listContacts, updateContact } from '../api/contacts.ts';
import { ApiError } from '../api/client.ts';
import { listTags } from '../api/tags.ts';
import { COMPANY_SUGGESTION_LIMIT } from '../constants/list.ts';
import type {
  BulkAssignTagRequest,
  Contact,
  ListCompaniesParams,
  ListContactsParams,
  UpdateContactRequest,
} from '../types/api.ts';

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
    detail: (id: number | null) => [...queryKeys.contacts.all, 'detail', id] as const,
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

/** One contact for the detail page. `null` (a malformed id in the URL) sends no request. */
export function useContactQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: id === null ? skipToken : () => getContact(id),
  });
}

/**
 * Saves an edit (optimistic locking: the body carries the version it was based on). The saved
 * contact goes straight into the detail cache, so the page shows it without waiting for a
 * refetch; the lists (and later the activity feed) are refreshed because they show it too.
 */
export function useUpdateContactMutation(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateContactRequest) => updateContact(id, body),
    onSuccess: (contact) => {
      queryClient.setQueryData(queryKeys.contacts.detail(id), contact);
      void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
    onError: (error) => {
      // Deleted meanwhile: refetching the detail turns the page into "Contact not found".
      if (error instanceof ApiError && error.code === 'NOT_FOUND') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(id) });
      }
    },
  });
}

/** Puts a contact into the detail cache, e.g. the current one from a 409 ("Reload latest"). */
export function useSetContactData() {
  const queryClient = useQueryClient();
  return (contact: Contact) => queryClient.setQueryData(queryKeys.contacts.detail(contact.id), contact);
}

export function useBulkAssignTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkAssignTagRequest) => bulkAssignTag(body),
    // Tags show in the list rows and on the detail page, so refresh everything contact-related.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all }),
    // On an error nothing was written (one transaction). A 404 means our data is out of date
    // (a tag or contacts were deleted), so refresh the tags and everything contact-related
    // (the lists, which drop the missing rows from the selection, and the total).
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'NOT_FOUND') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
      }
    },
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
