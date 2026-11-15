import type { Contact } from '../../types/api.ts';
import type { DETAIL_VIEW_STATUS } from './contactsDetailView.constants.ts';

/** What the page shows. Built by useContactsDetailView from the contact query. */
export type ContactDetailData =
  | { status: typeof DETAIL_VIEW_STATUS.LOADING }
  | { status: typeof DETAIL_VIEW_STATUS.ERROR }
  /** A 404, or an id in the URL that can't be a contact id (then no request is sent). */
  | { status: typeof DETAIL_VIEW_STATUS.NOT_FOUND }
  | { status: typeof DETAIL_VIEW_STATUS.READY; contact: Contact };

/** The states with no contact to show: the page renders FailedContactScreens instead. */
export type FailedContactStatus = typeof DETAIL_VIEW_STATUS.NOT_FOUND | typeof DETAIL_VIEW_STATUS.ERROR;
