import { useId, type FormEvent } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { TextField } from '../../../../components/TextField';
import type { Contact } from '../../../../types/api.ts';
import { formatDateTime } from '../../../../utils/format.ts';
import {
  CONTACT_FIELD_CONFIG,
  CONTACT_FIELD_SECTIONS,
  DETAIL_VIEW_TEXT,
  SECTION_GRID_CLASSES,
  SECTION_TYPES,
} from '../../contactsDetailView.constants.ts';
import type { ContactField, ContactFormState, EditableSection } from '../../contactsDetailView.types.ts';
import { DetailCard } from '../DetailCard';
import { ConflictDialog } from './ConflictDialog.tsx';

const TEXT = DETAIL_VIEW_TEXT.DETAILS;
// Only editable sections become inputs; the timestamps are the line under them.
const EDITABLE_SECTIONS = CONTACT_FIELD_SECTIONS.filter(
  (section): section is EditableSection => section.type === SECTION_TYPES.EDITABLE,
);
// The first field gets focus when editing starts.
const FIRST_FIELD = EDITABLE_SECTIONS[0]?.fields[0];

interface ContactEditFormProps {
  contact: Contact;
  form: ContactFormState;
}

/** Edit mode of the Details card (mockups D2–D6). */
export function ContactEditForm({ contact, form }: ContactEditFormProps) {
  const formId = useId();
  const fieldId = (field: ContactField) => `${formId}-${field}`;

  const handleSubmit = (event: FormEvent) => {
    const firstInvalid = form.handleSubmit(event);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
    }
  };

  const field = (name: ContactField) => {
    const { label, inputType, maxLength } = CONTACT_FIELD_CONFIG[name];
    return (
      <TextField
        key={name}
        id={fieldId(name)}
        label={label}
        type={inputType}
        maxLength={maxLength}
        value={form.values[name]}
        error={form.errors[name]}
        onChange={(event) => form.handleChange(name, event.target.value)}
        onBlur={() => form.handleBlur(name)}
        autoComplete="off"
        autoFocus={name === FIRST_FIELD}
      />
    );
  };

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
          {EDITABLE_SECTIONS.map((section) => (
            <fieldset key={section.key} disabled={form.isSaving} className={SECTION_GRID_CLASSES[section.columns]}>
              {section.fields.map(field)}
            </fieldset>
          ))}
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
