import { useQuery } from '@tanstack/react-query';
import { listTags } from '../api/tags.ts';
import { queryKeys } from './queryKeys.ts';

/** All tags, shared by the tags filter, the assign-tag menu and the detail page's tag picker. */
export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: listTags,
    // Tags only come from the seed (there is no endpoint to create them), so they rarely change.
    staleTime: 5 * 60_000,
  });
}
