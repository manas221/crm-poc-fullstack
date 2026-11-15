import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bulkAssignTag, listContacts } from '../api/contacts.ts';
import { DEFAULT_ORDER, DEFAULT_SORT } from '../constants/list.ts';
import type { BulkAssignTagRequest, ListContactsParams } from '../types/api.ts';
import { queryKeys } from './queryKeys.ts';

export function useContactsQuery(params: ListContactsParams) {
  return useQuery({
    queryKey: queryKeys.contacts.list(params),
    queryFn: () => listContacts(params),
    // Keep showing the current rows while the next page loads, instead of flashing a skeleton.
    placeholderData: keepPreviousData,
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
    queryFn: () => listContacts({ page: 1, limit: 1, sort: DEFAULT_SORT, order: DEFAULT_ORDER }),
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
