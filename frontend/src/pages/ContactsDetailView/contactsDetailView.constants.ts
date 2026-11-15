import { MAX_COMPANY_LENGTH, MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from '../../constants/contact.ts';
import type { ContactField } from './contactsDetailView.types.ts';

/** What the page shows, from the contact query (see useContactsDetailView). */
export const DETAIL_VIEW_STATUS = {
  LOADING: 'loading',
  ERROR: 'error',
  NOT_FOUND: 'notFound',
  READY: 'ready',
} as const;

export const DETAIL_VIEW_TEXT = {
  BACK_TO_CONTACTS: 'Back to contacts',
  HEADER: {
    LOADING: 'Loading contact…',
  },
  NOT_FOUND: {
    TITLE: 'Contact not found',
    DESCRIPTION: 'It may have been deleted, or the link may be wrong.',
  },
  LOAD_ERROR: {
    MESSAGE: 'Couldn’t load this contact. Please try again.',
    RETRY: 'Retry',
  },
  DETAILS: {
    EDIT: 'Edit',
    CREATED: 'Created',
    LAST_UPDATED: 'Last updated',
    TIMESTAMPS: (created: string, updated: string) => `Created ${created} · Last updated ${updated}`,
    CANCEL: 'Cancel',
    SAVE: 'Save',
    SAVING: 'Saving…',
    SAVE_FAILED: 'Couldn’t save changes. Please try again.',
    ERRORS: {
      FIRST_NAME_REQUIRED: 'First name is required',
      LAST_NAME_REQUIRED: 'Last name is required',
      NAME_TOO_LONG: (label: string) => `${label} must be ${MAX_NAME_LENGTH} characters or fewer`,
      EMAIL_INVALID: 'Enter a valid email address',
      EMAIL_TOO_LONG: `Email must be ${MAX_EMAIL_LENGTH} characters or fewer`,
      EMAIL_TAKEN: 'Another contact already uses this email.',
      PHONE_INVALID: 'Enter a valid phone number: 7–20 digits, spaces, ( ) or -, optionally starting with +',
      COMPANY_TOO_LONG: `Company must be ${MAX_COMPANY_LENGTH} characters or fewer`,
      /** The server rejected a value the form let through (its checks are a little stricter). */
      INVALID: (label: string) => `${label} isn’t valid`,
    },
  },
  CONFLICT: {
    TITLE: 'This contact was changed by someone else',
    /** `when` is e.g. "1 min ago". */
    DESCRIPTION: (when: string) => `Someone else saved this contact ${when}, while you were editing.`,
    FIELDS_DIFFER: 'These fields differ:',
    NO_DIFFERENCES: 'Their saved values already match your changes.',
    FIELD: 'Field',
    YOUR_CHANGE: 'Your change',
    CURRENT_VALUE: 'Current value',
    EXPLANATION: '“Reload latest” discards your edits. “Apply my changes again” overwrites the current values with yours.',
    CANCEL: 'Cancel',
    RELOAD: 'Reload latest',
    APPLY: 'Apply my changes again',
    APPLYING: 'Applying…',
  },
  TAGS: {
    ADD_TAG: 'Add tag',
    LOADING: 'Loading tags…',
    LOAD_ERROR: 'Couldn’t load tags.',
    RETRY: 'Retry',
    NO_TAGS: 'There are no tags to add yet.',
    HAS_EVERY_TAG: 'This contact already has every tag.',
    REMOVE_ARIA_LABEL: (name: string) => `Remove tag ${name}`,
    SAVING_ARIA_LABEL: (name: string) => `Saving ${name}…`,
    ADD_FAILED: (name: string) => `Couldn’t add “${name}”. Please try again.`,
    REMOVE_FAILED: (name: string) => `Couldn’t remove “${name}”. Please try again.`,
    TAG_GONE: (name: string) => `“${name}” no longer exists.`,
  },
  SECTIONS: {
    DETAILS: 'Details',
    EDITING: 'Editing',
    ACTIVITY: 'Recent activity',
    TAGS: 'Tags',
    TAGS_AUTOSAVE: 'Changes save automatically',
  },
} as const;

/** Keys of the editable contact fields: the edit form's fields and the PATCH body's (types/api.ts ContactFields). */
export const CONTACT_FIELD_KEYS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE: 'phone',
  COMPANY: 'company',
} as const satisfies Record<string, ContactField>;

/** The editable fields, in form order. */
export const CONTACT_FIELDS: readonly ContactField[] = Object.values(CONTACT_FIELD_KEYS);

export const CONTACT_FIELD_LABELS: Record<ContactField, string> = {
  [CONTACT_FIELD_KEYS.FIRST_NAME]: 'First name',
  [CONTACT_FIELD_KEYS.LAST_NAME]: 'Last name',
  [CONTACT_FIELD_KEYS.EMAIL]: 'Email',
  [CONTACT_FIELD_KEYS.PHONE]: 'Phone',
  [CONTACT_FIELD_KEYS.COMPANY]: 'Company',
};
