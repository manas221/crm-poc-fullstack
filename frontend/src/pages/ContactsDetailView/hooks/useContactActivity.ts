import { useContactActivitiesQuery } from '../../../queries/contacts-queries.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import type { ActivityFeedData } from '../contactsDetailView.types.ts';

/** The "Recent activity" card's data, and Retry. */
export function useContactActivity(contactId: number) {
  const query = useContactActivitiesQuery(contactId);

  let feedData: ActivityFeedData;
  if (query.data) {
    // While a refetch runs (after an edit or a tag change) the current entries stay on screen.
    feedData = { status: DETAIL_VIEW_STATUS.READY, activities: query.data };
  } else if (query.isError && !query.isFetching) {
    feedData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    feedData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  const handleRetry = () => void query.refetch();

  return { feedData, handleRetry };
}
