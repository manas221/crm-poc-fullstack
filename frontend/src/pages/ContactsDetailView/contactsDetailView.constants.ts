import {
  EMAIL_PATTERN,
  MAX_COMPANY_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  PHONE_PATTERN,
} from '../../constants/contact.ts';
import type {
  ContactField,
  ContactFieldConfig,
  ContactFieldSection,
  ContactTimestampField,
} from './contactsDetailView.types.ts';

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
      REQUIRED: (label: string) => `${label} is required`,
      TOO_LONG: (label: string, max: number) => `${label} must be ${max} characters or fewer`,
      EMAIL_INVALID: 'Enter a valid email address',
      EMAIL_TAKEN: 'Another contact already uses this email.',
      PHONE_INVALID: 'Enter a valid phone number: 7–20 digits, spaces, ( ) or -, optionally starting with +',
      /** The server rejected a value the form let through (its checks are a little stricter). */
      INVALID: (label: string) => `${label} isn’t valid`,
    },
  },
  CONFLICT: {
    TITLE: 'This contact was changed by someone else',
    /** `when` is e.g. "16 Nov 2026, 10:42". */
    DESCRIPTION: (when: string) => `Someone else saved this contact on ${when}, while you were editing.`,
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
  ACTIVITY: {
    TAG_ADDED: 'Tag added',
    TAG_REMOVED: 'Tag removed',
    CONTACT_UPDATED: 'Contact updated',
    BULK: (tagName: string) => `${tagName} (bulk)`,
    /** `field` is lowercase, e.g. "email". */
    FIELD_CHANGED: (field: string, from: string, to: string) => `${field} changed from ${from} to ${to}`,
    FIELD_SET: (field: string, to: string) => `${field} set to ${to}`,
    FIELD_CLEARED: (field: string) => `${field} cleared`,
    FIELD_CHANGED_SHORT: (field: string) => `${field} changed`,
    LOADING: 'Loading activity…',
    LOAD_ERROR: 'Couldn’t load activity.',
    RETRY: 'Retry',
    EMPTY: 'No activity yet. Changes to this contact will appear here.',
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

/** The editable fields. */
export const CONTACT_FIELDS: readonly ContactField[] = Object.values(CONTACT_FIELD_KEYS);

/** The <input type> a field uses. */
export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  TEL: 'tel',
} as const;

const { FIRST_NAME, LAST_NAME, EMAIL, PHONE, COMPANY } = CONTACT_FIELD_KEYS;
const ERRORS = DETAIL_VIEW_TEXT.DETAILS.ERRORS;

/** Each field's label, input and rules. A new field is one entry here plus a place in a section. */
export const CONTACT_FIELD_CONFIG: Record<ContactField, ContactFieldConfig> = {
  [FIRST_NAME]: { label: 'First name', inputType: INPUT_TYPES.TEXT, required: true, maxLength: MAX_NAME_LENGTH },
  [LAST_NAME]: { label: 'Last name', inputType: INPUT_TYPES.TEXT, required: true, maxLength: MAX_NAME_LENGTH },
  [EMAIL]: {
    label: 'Email',
    inputType: INPUT_TYPES.EMAIL,
    maxLength: MAX_EMAIL_LENGTH,
    pattern: { value: EMAIL_PATTERN, message: ERRORS.EMAIL_INVALID },
    lowercase: true,
  },
  [PHONE]: { label: 'Phone', inputType: INPUT_TYPES.TEL, pattern: { value: PHONE_PATTERN, message: ERRORS.PHONE_INVALID } },
  [COMPANY]: { label: 'Company', inputType: INPUT_TYPES.TEXT, maxLength: MAX_COMPANY_LENGTH },
};

export const CONTACT_TIMESTAMP_KEYS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const satisfies Record<string, ContactTimestampField>;

export const CONTACT_TIMESTAMP_LABELS: Record<ContactTimestampField, string> = {
  [CONTACT_TIMESTAMP_KEYS.CREATED_AT]: DETAIL_VIEW_TEXT.DETAILS.CREATED,
  [CONTACT_TIMESTAMP_KEYS.UPDATED_AT]: DETAIL_VIEW_TEXT.DETAILS.LAST_UPDATED,
};

/** What a section holds (see ContactFieldSection). */
export const SECTION_TYPES = {
  EDITABLE: 'editable',
  TIMESTAMPS: 'timestamps',
} as const;

/** How the Details card groups the fields, in order. View mode shows every section; edit mode the editable ones. */
export const CONTACT_FIELD_SECTIONS: readonly ContactFieldSection[] = [
  { type: SECTION_TYPES.EDITABLE, key: 'contact', columns: 2, fields: [FIRST_NAME, LAST_NAME, EMAIL, PHONE, COMPANY] },
  {
    type: SECTION_TYPES.TIMESTAMPS,
    key: 'timestamps',
    columns: 2,
    fields: [CONTACT_TIMESTAMP_KEYS.CREATED_AT, CONTACT_TIMESTAMP_KEYS.UPDATED_AT],
  },
];

/** A section's grid, by its column count. */
export const SECTION_GRID_CLASSES: Record<ContactFieldSection['columns'], string> = {
  1: 'grid gap-y-5',
  2: 'grid gap-x-8 gap-y-5 sm:grid-cols-2',
};
