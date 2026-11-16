import { useLocation, useNavigate, useParams } from 'react-router';
import { ApiError } from '../../../api/client.ts';
import { useContactActivitiesQuery, useContactQuery } from '../../../queries/contacts-queries.ts';
import { isFromList } from '../../../utils/navigation.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import { parseContactId } from '../contactsDetailView.helpers.ts';
import type { ActivityFeedData, ContactDetailData } from '../contactsDetailView.types.ts';
import { useContactEditForm } from './useContactEditForm.ts';
import { useContactTagsState } from './useContactTagsState.ts';

/**
 * Everything the detail page needs, in one place (like useContactsListView): the contact id
 * from the URL, the query built from it, derived view state and the action handlers.
 */
export function useContactsDetailView() {
  const { id } = useParams();
  const contactId = parseContactId(id);
  const contactQuery = useContactQuery(contactId);

  const activitiesQuery = useContactActivitiesQuery(contactId);
  const navigate = useNavigate();
  const { state } = useLocation();

  const { data, error, isError, isFetching } = contactQuery;

  let contactData: ContactDetailData;
  if (contactId === null || (error instanceof ApiError && error.code === 'NOT_FOUND')) {
    contactData = { status: DETAIL_VIEW_STATUS.NOT_FOUND };
  } else if (data) {
    contactData = { status: DETAIL_VIEW_STATUS.READY, contact: data };
  } else if (isError && !isFetching) {
    contactData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    contactData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  const handleBack = () => {
    if (isFromList(state)) {
      void navigate(-1);
    } else {
      void navigate('/', { replace: true });
    }
  };

  const handleRetry = () => void contactQuery.refetch();
  const handleActivityRetry = () => void activitiesQuery.refetch();


  // for recent activity component
  let activityData: ActivityFeedData;
  if (activitiesQuery.data) {
    // While a refetch runs (after an edit or a tag change) the current entries stay on screen.
    activityData = { status: DETAIL_VIEW_STATUS.READY, activities: activitiesQuery.data };
  } else if (activitiesQuery.isError && !activitiesQuery.isFetching) {
    activityData = { status: DETAIL_VIEW_STATUS.ERROR };
  } else {
    activityData = { status: DETAIL_VIEW_STATUS.LOADING };
  }

  // for details component (view / edit form)
  const contactFormState = useContactEditForm(data ?? null);

  // for tags component
  const contactTagsState = useContactTagsState(contactId, data?.tags ?? []);

  return {
    contactData,
    activityData,
    contactFormState,
    contactTagsState,
    handleBack,
    handleRetry,
    handleActivityRetry,
  };
}
