import type { Activity, Contact, ContactFields, Tag } from '../../types/api.ts';
import type { DETAIL_VIEW_STATUS } from './contactsDetailView.constants.ts';

/** What the page shows. Built by useContactsDetailView from the contact query. */
export type ContactDetailData =
  | { status: typeof DETAIL_VIEW_STATUS.LOADING }
  | { status: typeof DETAIL_VIEW_STATUS.ERROR }
  /** A 404, or an id in the URL that can't be a contact id (then no request is sent). */
  | { status: typeof DETAIL_VIEW_STATUS.NOT_FOUND }
  | { status: typeof DETAIL_VIEW_STATUS.READY; contact: Contact };

/** The states with no contact to show: the page renders FailedContactScreens (in ContactsDetailView.tsx) instead. */
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

/** The tags the "Add tag" picker offers. Built by useContactTags from the tags query. */
export type TagPickerData =
  | { status: typeof DETAIL_VIEW_STATUS.LOADING }
  | { status: typeof DETAIL_VIEW_STATUS.ERROR }
  /** `available`: the tags the contact doesn't have (yet). `total`: how many tags exist at all. */
  | { status: typeof DETAIL_VIEW_STATUS.READY; available: Tag[]; total: number };

/** A tag shown on the contact: one it has, or one being added. */
export interface ShownTag {
  tag: Tag;
  /** Being added or removed right now: shows a spinner instead of the remove button. */
  isSaving: boolean;
}

/** The last tag change that failed, shown under the tags. */
export interface TagChangeFailure {
  message: string;
  /** False when retrying can't help (the tag no longer exists). */
  canRetry: boolean;
}

/** What "Recent activity" shows. Built by useContactsDetailView from the activities query. */
export type ActivityFeedData =
  | { status: typeof DETAIL_VIEW_STATUS.LOADING }
  | { status: typeof DETAIL_VIEW_STATUS.ERROR }
  /** `activities` may be empty (mockup D9). */
  | { status: typeof DETAIL_VIEW_STATUS.READY; activities: Activity[] };

/** Which icon an entry gets: a blue tag, a grey tag, or a pencil. */
export type ActivityTone = 'tagAdded' | 'tagRemoved' | 'updated';

/** One timeline entry as text: "<title>: <detail>". */
export interface ActivityDescription {
  title: string;
  detail: string | null;
  tone: ActivityTone;
}
