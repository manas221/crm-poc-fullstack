import { useState, type FormEvent } from 'react';
import { useSetContactData, useUpdateContactMutation } from '../../../queries/contacts-queries.ts';
import type { Contact } from '../../../types/api.ts';
import { CONTACT_FIELDS } from '../contactsDetailView.constants.ts';
import {
  emptyFormValues,
  getChangedFields,
  getConflictRows,
  getSaveError,
  rebaseFormValues,
  toFormValues,
  validateContactForm,
} from '../contactsDetailView.helpers.ts';
import type { ContactField, ContactFormErrors, ContactFormState, ContactFormValues } from '../contactsDetailView.types.ts';

/**
 * State and handlers of the Details card's edit form. Called by useContactsDetailView (not by
 * the card), so other parts of the page can use it too. `contact` is null until it has loaded.
 *
 * Edit starts by snapshotting the contact as `base`: its version is what the save is checked
 * against (CLAUDE.md §7). Later refetches of the contact (e.g. after a tag change) don't move
 * the base, or a save could silently overwrite someone else's edit.
 */
export function useContactEditForm(contact: Contact | null): ContactFormState {
  // The contact as it was when editing started; null in view mode.
  const [base, setBase] = useState<Contact | null>(null);
  const [values, setValues] = useState<ContactFormValues>(emptyFormValues);

  // Client errors show once a field has been left, or after Save was pressed.
  const [touched, setTouched] = useState<ReadonlySet<ContactField>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);

  // From the server (e.g. email taken). Each one goes away when its field is edited.
  const [serverErrors, setServerErrors] = useState<ContactFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // The current contact from a 409: the conflict dialog is open while this is set.
  const [conflict, setConflict] = useState<Contact | null>(null);
  const mutation = useUpdateContactMutation();
  const setContactData = useSetContactData();

  // The page stays mounted when the URL moves to another contact: an edit of the previous
  // one doesn't carry over.
  const isEditing = base !== null && base.id === contact?.id;

  const clientErrors = validateContactForm(values);
  const isShown = (field: ContactField) => submitted || touched.has(field);
  const errors: ContactFormErrors = {};
  for (const field of CONTACT_FIELDS) {
    const error = serverErrors[field] ?? (isShown(field) ? clientErrors[field] : undefined);
    if (error) {
      errors[field] = error;
    }
  }
  // Save is disabled while the form shows problems it knows about. A server error (email
  // taken) doesn't disable it: the user may fix it, or just retry.
  const hasShownClientErrors = CONTACT_FIELDS.some((field) => isShown(field) && clientErrors[field]);
  const conflictRows = isEditing && conflict ? getConflictRows(base, values, conflict) : [];

  const exitEdit = () => {
    setBase(null);
    setConflict(null);
  };

  function save(from: Contact, draft: ContactFormValues) {
    const changes = getChangedFields(from, draft);
    if (Object.keys(changes).length === 0) {
      exitEdit(); // nothing to save
      return;
    }
    setSaveMessage(null);
    mutation.mutate(
      { id: from.id, body: { version: from.version, ...changes } },
      {
        onSuccess: exitEdit,
        onError: (error) => {
          const result = getSaveError(error);
          setConflict(result.conflict);
          setServerErrors(result.fieldErrors);
          setSaveMessage(result.message);
        },
      },
    );
  }

  /** A fresh form from the contact as it is now. */
  const handleStartEdit = () => {
    if (!contact) {
      return;
    }
    setBase(contact);
    setValues(toFormValues(contact));
    setTouched(new Set());
    setSubmitted(false);
    setServerErrors({});
    setSaveMessage(null);
    setConflict(null);
    mutation.reset();
  };

  const handleChange = (field: ContactField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setServerErrors(({ [field]: _removed, ...rest }) => rest);
  };

  const handleBlur = (field: ContactField) => setTouched((previous) => new Set(previous).add(field));

  const handleSubmit = (event: FormEvent): ContactField | null => {
    event.preventDefault();
    if (!base || mutation.isPending) {
      return null;
    }
    setSubmitted(true);
    const firstInvalid = CONTACT_FIELDS.find((field) => clientErrors[field]);
    if (firstInvalid) {
      return firstInvalid;
    }
    save(base, values);
    return null;
  };

  // Conflict dialog ----------------------------------------------------------------------

  const handleCloseConflict = () => {
    if (!mutation.isPending) {
      setConflict(null); // back to the form, still based on the old version
    }
  };

  /** Discard my edits and show the contact as it is now. */
  const handleReloadLatest = () => {
    if (conflict) {
      setContactData(conflict);
      exitEdit();
    }
  };

  /** Move my edits onto the current version and save them again (only the fields I changed). */
  const handleApplyAgain = () => {
    if (!base || !conflict || mutation.isPending) {
      return;
    }
    const rebased = rebaseFormValues(base, values, conflict);
    setBase(conflict);
    setValues(rebased);
    if (Object.keys(getChangedFields(conflict, rebased)).length === 0) {
      // They saved exactly my changes: nothing left to apply.
      setContactData(conflict);
      exitEdit();
      return;
    }
    save(conflict, rebased);
  };

  return {
    isEditing,
    values,
    errors,
    saveMessage,
    conflict,
    conflictRows,
    isSaving: mutation.isPending,
    isSaveDisabled: mutation.isPending || hasShownClientErrors,
    handleStartEdit,
    handleChange,
    handleBlur,
    handleSubmit,
    handleCancel: exitEdit,
    handleCloseConflict,
    handleReloadLatest,
    handleApplyAgain,
  };
}
