import { useParams } from 'react-router';
import { ApiError } from '../../../api/client.ts';
import { useContactQuery } from '../../../queries/contacts-queries.ts';
import { DETAIL_VIEW_STATUS } from '../contactsDetailView.constants.ts';
import { parseContactId } from '../contactsDetailView.helpers.ts';
import type { ContactDetailData } from '../contactsDetailView.types.ts';
import { useBackToContacts } from './useBackToContacts.ts';

/**
 * Everything the detail page needs, in one place (like useContactsListView): the contact id
 * from the URL, the query built from it, derived view state and the action handlers.
 */
export function useContactsDetailView() {
  const { id } = useParams();
  const contactId = parseContactId(id);
  const contactQuery = useContactQuery(contactId);
  const handleBack = useBackToContacts();

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

  const handleRetry = () => void contactQuery.refetch();

  return {
    contactData,
    handleBack,
    handleRetry,
  };
}
