import type { Contact, ContactFields } from '../../types/api.ts';
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

export type ContactField = keyof ContactFields;

/** The edit form's inputs, as typed (an empty string for an empty field). */
export type ContactFormValues = Record<ContactField, string>;

/** One message per invalid field. */
export type ContactFormErrors = Partial<Record<ContactField, string>>;

/** A row of the conflict dialog: a field you changed whose saved value is now different. */
export interface ConflictRow {
  field: ContactField;
  yours: string | null;
  current: string | null;
}

/** What a failed save means for the form (see getSaveError). */
export interface SaveError {
  /** The contact as it is now, from a 409 VERSION_CONFLICT: opens the conflict dialog. */
  conflict: Contact | null;
  /** Shown under the fields, e.g. "Another contact already uses this email." */
  fieldErrors: ContactFormErrors;
  /** Shown above the form, e.g. "Couldn’t save changes." */
  message: string | null;
}
