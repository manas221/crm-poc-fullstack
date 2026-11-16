import { useLocation, useNavigate, useParams } from 'react-router';
import { ApiError } from '../../../api/client.ts';
import { useContactQuery } from '../../../queries/contacts-queries.ts';
import { isFromList } from '../../../utils/navigation.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import { parseContactId } from '../contactsDetailView.helpers.ts';
import type { ContactDetailData } from '../contactsDetailView.types.ts';

/**
 * Everything the detail page needs, in one place (like useContactsListView): the contact id
 * from the URL, the query built from it, derived view state and the action handlers.
 */
export function useContactsDetailView() {
  const { id } = useParams();
  const contactId = parseContactId(id);
  const contactQuery = useContactQuery(contactId);
  const navigate = useNavigate();
  const { state } = useLocation();

  const { data, error, isError, isFetching } = contactQuery;

  let contactData: ContactDetailData;
  if (contactId === null || (error instanceof ApiError && error.code === 'NOT_FOUND')) {
    // Checked before `data`: if the contact is deleted while open, a refetch 404s while the
    // old data is still cached, and showing it would be misleading.
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

  return {
    contactData,
    handleBack,
    handleRetry,
  };
}
