import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listContacts } from '../../api/contacts.ts';
import type { ListContactsParams } from '../../types/api.ts';

export function useContacts(params: ListContactsParams) {
  return useQuery({
    queryKey: ['contacts', 'list', params],
    queryFn: () => listContacts(params),
    // Keep showing the current page while the next one loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
  });
}
