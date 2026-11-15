import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listCompanies } from '../api/companies.ts';
import { COMPANY_SUGGESTION_LIMIT } from '../constants/list.ts';
import { queryKeys } from './queryKeys.ts';

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
