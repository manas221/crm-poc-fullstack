import { ApiError } from '../../api/client.ts';
import { ACTIVITY_TYPES, CONTACT_TAG_ACTIONS } from '../../constants/contact.ts';
import {
  EMAIL_PATTERN,
  MAX_COMPANY_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  PHONE_PATTERN,
} from '../../constants/contact.ts';
import type { ContactTagChange } from '../../queries/contacts-queries.ts';
import type {
  Activity,
  ContactFields,
  ContactTagNotFoundDetails,
  FieldChange,
  ValidationErrorDetails,
  VersionConflictDetails,
} from '../../types/api.ts';
import {
  CONTACT_FIELD_KEYS,
  CONTACT_FIELD_LABELS,
  CONTACT_FIELDS,
  DETAIL_VIEW_STATUS,
  DETAIL_VIEW_TEXT,
} from './contactsDetailView.constants.ts';
import type {
  ActivityDescription,
  ConflictRow,
  ContactDetailData,
  ContactField,
  ContactFormErrors,
  ContactFormValues,
  FailedContactStatus,
  SaveError,
  TagChangeFailure,
} from './contactsDetailView.types.ts';

/**
 * The :id route param as a contact id, or null when it can't be one ("abc", "0", "1.5",
 * "007"). Same rule as the backend's contactIdParamsSchema, so a malformed link shows "not
 * found" straight away instead of sending a request that would only come back as a 400.
 */
export function parseContactId(raw: string | undefined): number | null {
  if (!raw || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

/** Not found or failed to load. Narrows `data`, so code after the check only sees loading / ready. */
export function isFailedContactData(
  data: ContactDetailData,
): data is Extract<ContactDetailData, { status: FailedContactStatus }> {
  return data.status === DETAIL_VIEW_STATUS.NOT_FOUND || data.status === DETAIL_VIEW_STATUS.ERROR;
}

// ---------------------------------------------------------------------------------------
// Edit form. Pure functions: the form hook (useContactEditForm) keeps only the state.

const ERRORS = DETAIL_VIEW_TEXT.DETAILS.ERRORS;
const { FIRST_NAME, LAST_NAME, EMAIL, PHONE, COMPANY } = CONTACT_FIELD_KEYS;

export function toFormValues(contact: ContactFields): ContactFormValues {
  return {
    [FIRST_NAME]: contact[FIRST_NAME],
    [LAST_NAME]: contact[LAST_NAME],
    [EMAIL]: contact[EMAIL] ?? '',
    [PHONE]: contact[PHONE] ?? '',
    [COMPANY]: contact[COMPANY] ?? '',
  };
}

/** The values as the backend will store them: trimmed, blank → null, email lowercased. */
export function normalizeFormValues(values: ContactFormValues): ContactFields {
  const optional = (value: string) => value.trim() || null;
  return {
    [FIRST_NAME]: values[FIRST_NAME].trim(),
    [LAST_NAME]: values[LAST_NAME].trim(),
    [EMAIL]: optional(values[EMAIL])?.toLowerCase() ?? null,
    [PHONE]: optional(values[PHONE]),
    [COMPANY]: optional(values[COMPANY]),
  };
}

/** The same rules as the backend's updateContactBodySchema, with messages for the user. */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const normalized = normalizeFormValues(values);
  const firstName = normalized[FIRST_NAME];
  const lastName = normalized[LAST_NAME];
  const email = normalized[EMAIL];
  const phone = normalized[PHONE];
  const company = normalized[COMPANY];
  const errors: ContactFormErrors = {};

  if (!firstName) {
    errors[FIRST_NAME] = ERRORS.FIRST_NAME_REQUIRED;
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors[FIRST_NAME] = ERRORS.NAME_TOO_LONG(CONTACT_FIELD_LABELS[FIRST_NAME]);
  }
  if (!lastName) {
    errors[LAST_NAME] = ERRORS.LAST_NAME_REQUIRED;
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors[LAST_NAME] = ERRORS.NAME_TOO_LONG(CONTACT_FIELD_LABELS[LAST_NAME]);
  }
  if (email !== null) {
    if (email.length > MAX_EMAIL_LENGTH) {
      errors[EMAIL] = ERRORS.EMAIL_TOO_LONG;
    } else if (!EMAIL_PATTERN.test(email)) {
      errors[EMAIL] = ERRORS.EMAIL_INVALID;
    }
  }
  if (phone !== null && !PHONE_PATTERN.test(phone)) {
    errors[PHONE] = ERRORS.PHONE_INVALID;
  }
  if (company !== null && company.length > MAX_COMPANY_LENGTH) {
    errors[COMPANY] = ERRORS.COMPANY_TOO_LONG;
  }
  return errors;
}

/** The fields whose (normalised) value differs from `base`: what a save sends. */
export function getChangedFields(base: ContactFields, values: ContactFormValues): Partial<ContactFields> {
  const next = normalizeFormValues(values);
  const changes: Partial<Record<ContactField, string | null>> = {};
  for (const field of CONTACT_FIELDS) {
    if (next[field] !== base[field]) {
      changes[field] = next[field];
    }
  }
  return changes as Partial<ContactFields>;
}

/**
 * The fields you changed (from `base`, what you started editing) whose saved value is now
 * different from yours: what "Apply my changes again" would overwrite.
 */
export function getConflictRows(base: ContactFields, values: ContactFormValues, current: ContactFields): ConflictRow[] {
  const yours = normalizeFormValues(values);
  return Object.keys(getChangedFields(base, values))
    .map((key) => key as ContactField)
    .filter((field) => yours[field] !== current[field])
    .map((field) => ({ field, yours: yours[field], current: current[field] }));
}

/**
 * Your edits moved onto `current` (the contact someone else saved): the fields you changed
 * keep your values, every other field takes theirs. Saving the result against current's
 * version sends only your changes, so their edits to other fields survive.
 */
export function rebaseFormValues(base: ContactFields, values: ContactFormValues, current: ContactFields): ContactFormValues {
  const changed = getChangedFields(base, values);
  const rebased = toFormValues(current);
  for (const field of CONTACT_FIELDS) {
    if (field in changed) {
      rebased[field] = values[field];
    }
  }
  return rebased;
}

/** What a failed save means for the form: a conflict, errors under fields, or a message. */
export function getSaveError(error: unknown): SaveError {
  const none: SaveError = { conflict: null, fieldErrors: {}, message: null };
  if (!(error instanceof ApiError)) {
    return { ...none, message: DETAIL_VIEW_TEXT.DETAILS.SAVE_FAILED };
  }
  switch (error.code) {
    case 'VERSION_CONFLICT': {
      const current = (error.details as VersionConflictDetails | undefined)?.current;
      return current ? { ...none, conflict: current } : { ...none, message: DETAIL_VIEW_TEXT.DETAILS.SAVE_FAILED };
    }
    case 'EMAIL_TAKEN':
      return { ...none, fieldErrors: { [EMAIL]: ERRORS.EMAIL_TAKEN } };
    case 'VALIDATION_ERROR': {
      const fieldErrors: ContactFormErrors = {};
      const serverFields = (error.details as ValidationErrorDetails | undefined)?.fieldErrors ?? {};
      for (const field of CONTACT_FIELDS) {
        if (serverFields[field]?.length) {
          fieldErrors[field] = ERRORS.INVALID(CONTACT_FIELD_LABELS[field]);
        }
      }
      return Object.keys(fieldErrors).length > 0
        ? { ...none, fieldErrors }
        : { ...none, message: DETAIL_VIEW_TEXT.DETAILS.SAVE_FAILED };
    }
    case 'NOT_FOUND':
      // Deleted meanwhile: the mutation refetches the contact and the page shows "not found".
      return none;
    default:
      return { ...none, message: DETAIL_VIEW_TEXT.DETAILS.SAVE_FAILED };
  }
}

// ---------------------------------------------------------------------------------------
// Tags

/**
 * What a failed add / remove shows under the tags. null when the contact itself is gone: the
 * mutation refetches it, and the page becomes "Contact not found".
 */
export function getTagChangeFailure(error: unknown, { action, tag }: ContactTagChange): TagChangeFailure | null {
  if (error instanceof ApiError && error.code === 'NOT_FOUND') {
    const details = error.details as ContactTagNotFoundDetails | undefined;
    if (details?.contactId !== undefined) {
      return null;
    }
    return { message: DETAIL_VIEW_TEXT.TAGS.TAG_GONE(tag.name), canRetry: false };
  }
  const message =
    action === CONTACT_TAG_ACTIONS.ADD
      ? DETAIL_VIEW_TEXT.TAGS.ADD_FAILED(tag.name)
      : DETAIL_VIEW_TEXT.TAGS.REMOVE_FAILED(tag.name);
  return { message, canRetry: true };
}

// ---------------------------------------------------------------------------------------
// Activity

const ACTIVITY_TEXT = DETAIL_VIEW_TEXT.ACTIVITY;

function describeChange(field: ContactField, { from, to }: FieldChange): string {
  const label = CONTACT_FIELD_LABELS[field].toLowerCase();
  if (from === null && to !== null) {
    return ACTIVITY_TEXT.FIELD_SET(label, to);
  }
  if (to === null) {
    return ACTIVITY_TEXT.FIELD_CLEARED(label);
  }
  return ACTIVITY_TEXT.FIELD_CHANGED(label, from ?? '', to);
}

/**
 * An activity entry as text. For an edit, the first changed field (in form order) is spelled
 * out and the rest are just named, as in the mockup: "email changed from a@x.com to b@x.com,
 * phone changed". That keeps an edit of many fields to a line or two.
 */
export function describeActivity(activity: Activity): ActivityDescription {
  switch (activity.type) {
    case ACTIVITY_TYPES.TAG_ADDED: {
      const { tagName, bulk } = activity.payload;
      return { title: ACTIVITY_TEXT.TAG_ADDED, detail: bulk ? ACTIVITY_TEXT.BULK(tagName) : tagName, tone: 'tagAdded' };
    }
    case ACTIVITY_TYPES.TAG_REMOVED:
      return { title: ACTIVITY_TEXT.TAG_REMOVED, detail: activity.payload.tagName, tone: 'tagRemoved' };
    case ACTIVITY_TYPES.CONTACT_UPDATED: {
      const { changes } = activity.payload;
      const fields = CONTACT_FIELDS.filter((field) => changes[field] !== undefined);
      const parts = fields.map((field, index) => {
        const change = changes[field] as FieldChange;
        return index === 0 ? describeChange(field, change) : ACTIVITY_TEXT.FIELD_CHANGED_SHORT(CONTACT_FIELD_LABELS[field].toLowerCase());
      });
      return { title: ACTIVITY_TEXT.CONTACT_UPDATED, detail: parts.length > 0 ? parts.join(', ') : null, tone: 'updated' };
    }
  }
}
