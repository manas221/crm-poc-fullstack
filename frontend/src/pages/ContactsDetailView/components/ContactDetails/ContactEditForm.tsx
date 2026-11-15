import { Fragment, useId, type FormEvent } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { TextField } from '../../../../components/TextField';
import { MAX_COMPANY_LENGTH, MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from '../../../../constants/contact.ts';
import type { Contact } from '../../../../types/api.ts';
import { formatDateTime } from '../../../../utils/format.ts';
import {
  CONTACT_FIELD_KEYS,
  CONTACT_FIELD_LABELS,
  CONTACT_FIELDS,
  DETAIL_VIEW_TEXT,
} from '../../contactsDetailView.constants.ts';
import type { ContactField } from '../../contactsDetailView.types.ts';
import { useContactEditForm } from '../../hooks/useContactEditForm.ts';
import { DetailCard } from '../DetailCard';
import { ConflictDialog } from './ConflictDialog.tsx';

const TEXT = DETAIL_VIEW_TEXT.DETAILS;
const { FIRST_NAME, LAST_NAME, EMAIL, PHONE, COMPANY } = CONTACT_FIELD_KEYS;

// Per-field input attributes. maxLength stops typing past the backend's limits.
const INPUTS: Record<ContactField, { type: string; maxLength?: number; className?: string }> = {
  [FIRST_NAME]: { type: 'text', maxLength: MAX_NAME_LENGTH },
  [LAST_NAME]: { type: 'text', maxLength: MAX_NAME_LENGTH },
  [EMAIL]: { type: 'email', maxLength: MAX_EMAIL_LENGTH },
  [PHONE]: { type: 'tel' },
  [COMPANY]: { type: 'text', maxLength: MAX_COMPANY_LENGTH },
};

interface ContactEditFormProps {
  contact: Contact;
  /** Leaves edit mode: after a save, Cancel, or "Reload latest". */
  onExitEdit: () => void;
}

/** Edit mode of the Details card (mockups D2–D6). */
export function ContactEditForm({ contact, onExitEdit }: ContactEditFormProps) {
  const form = useContactEditForm(contact, onExitEdit);
  const formId = useId();
  const fieldId = (field: ContactField) => `${formId}-${field}`;

  const handleSubmit = (event: FormEvent) => {
    const firstInvalid = form.handleSubmit(event);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
    }
  };

  const field = (name: ContactField) => (
    <TextField
      id={fieldId(name)}
      label={CONTACT_FIELD_LABELS[name]}
      value={form.values[name]}
      error={form.errors[name]}
      onChange={(event) => form.handleChange(name, event.target.value)}
      onBlur={() => form.handleBlur(name)}
      autoComplete="off"
      autoFocus={name === FIRST_NAME}
      {...INPUTS[name]}
    />
  );

  return (
    <>
      <DetailCard
        title={DETAIL_VIEW_TEXT.SECTIONS.DETAILS}
        aside={DETAIL_VIEW_TEXT.SECTIONS.EDITING}
        footer={
          <>
            <Button onClick={form.handleCancel} disabled={form.isSaving}>
              {TEXT.CANCEL}
            </Button>
            {/* Outside the <form> (in the card footer), so it's tied to it by id. */}
            <Button type="submit" form={formId} variant="primary" disabled={form.isSaveDisabled}>
              {form.isSaving ? TEXT.SAVING : TEXT.SAVE}
            </Button>
          </>
        }
      >
        {/* noValidate: the browser's own email check would pre-empt ours. */}
        <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-5">
          {form.saveMessage && <Alert variant="error">{form.saveMessage}</Alert>}
          <fieldset disabled={form.isSaving} className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {CONTACT_FIELDS.map((name) => (
              <Fragment key={name}>{field(name)}</Fragment>
            ))}
          </fieldset>
          <p className="text-sm text-gray-500">
            {TEXT.TIMESTAMPS(formatDateTime(contact.createdAt), formatDateTime(contact.updatedAt))}
          </p>
        </form>
      </DetailCard>

      <ConflictDialog
        current={form.conflict}
        rows={form.conflictRows}
        isApplying={form.isSaving}
        onCancel={form.handleCloseConflict}
        onReload={form.handleReloadLatest}
        onApply={form.handleApplyAgain}
      />
    </>
  );
}
