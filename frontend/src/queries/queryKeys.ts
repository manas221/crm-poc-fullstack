import type { ListCompaniesParams, ListContactsParams } from '../types/api.ts';

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
