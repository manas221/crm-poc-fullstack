import type { FormEvent } from 'react';
import type { Activity, Contact, ContactFields, Tag } from '../../types/api.ts';
import type { DETAIL_VIEW_STATUS, INPUT_TYPES, SECTION_TYPES } from './contactsDetailView.constants.ts';

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

export type InputType = (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];

/**
 * One editable field: its label, its input, and its rules (they mirror the backend's
 * updateContactBodySchema). Validation, normalising and the inputs all read from this.
 */
export interface ContactFieldConfig {
  label: string;
  inputType: InputType;
  /** Can't be left blank. Otherwise a blank value is saved as null. */
  required?: boolean;
  /** Also set on the input, so typing stops at the limit. */
  maxLength?: number;
  pattern?: { value: RegExp; message: string };
  /** Saved lowercased (email). */
  lowercase?: boolean;
}

/** The contact's read-only timestamps, shown in a section of their own. */
export type ContactTimestampField = keyof Pick<Contact, 'createdAt' | 'updatedAt'>;

interface SectionLayout {
  key: string;
  columns: 1 | 2;
}

/**
 * A group of fields laid out together. Editable sections show label + value in view mode and
 * inputs in edit mode; timestamp sections are read-only and show only in view mode.
 */
export type ContactFieldSection =
  | (SectionLayout & { type: typeof SECTION_TYPES.EDITABLE; fields: readonly ContactField[] })
  | (SectionLayout & { type: typeof SECTION_TYPES.TIMESTAMPS; fields: readonly ContactTimestampField[] });

export type EditableSection = Extract<ContactFieldSection, { type: typeof SECTION_TYPES.EDITABLE }>;

/** A row of the conflict dialog: a field you changed whose saved value is now different. */
export interface ConflictRow {
  field: ContactField;
  yours: string | null;
  current: string | null;
}

/** Everything the Details card needs to edit, built by useContactEditForm (passed down by useContactsDetailView). */
export interface ContactFormState {
  /** Edit mode is on: the card shows the form instead of the values. */
  isEditing: boolean;
  values: ContactFormValues;
  errors: ContactFormErrors;
  /** Shown above the form, e.g. "Couldn’t save changes." */
  saveMessage: string | null;
  /** The contact as it is now, from a 409: the conflict dialog is open while this is set. */
  conflict: Contact | null;
  conflictRows: ConflictRow[];
  isSaving: boolean;
  isSaveDisabled: boolean;
  /** Snapshots the contact as the base of the edit and opens the form. */
  handleStartEdit: () => void;
  handleChange: (field: ContactField, value: string) => void;
  handleBlur: (field: ContactField) => void;
  /** Returns the first invalid field (to focus), or null when the save went ahead. */
  handleSubmit: (event: FormEvent) => ContactField | null;
  handleCancel: () => void;
  handleCloseConflict: () => void;
  handleReloadLatest: () => void;
  handleApplyAgain: () => void;
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

/** The tags the "Add tag" picker offers. Built by useContactTagsState from the tags query. */
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

/** Everything the Tags card needs, built by useContactTagsState (passed down by useContactsDetailView). */
export interface ContactTagsState {
  /** The contact's tags, plus the one being added. */
  shownTags: ShownTag[];
  addTagButtonData: TagPickerData;
  /** A change is saving: the other controls are disabled (one change at a time). */
  isSaving: boolean;
  /** The last change that failed, if the latest change failed. */
  failure: TagChangeFailure | null;
  handleAdd: (tag: Tag) => void;
  handleRemove: (tag: Tag) => void;
  /** Sends the failed change again. */
  handleRetryChange: () => void;
  /** Refetches the tags after they failed to load. */
  handleRetryTags: () => void;
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
