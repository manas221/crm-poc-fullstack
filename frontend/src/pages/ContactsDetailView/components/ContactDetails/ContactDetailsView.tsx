import type { ReactNode } from 'react';
import { EmptyValue } from '../../../../components/EmptyValue';
import type { Contact } from '../../../../types/api.ts';
import { formatDateTime } from '../../../../utils/format.ts';
import {
  CONTACT_FIELD_CONFIG,
  CONTACT_FIELD_SECTIONS,
  CONTACT_TIMESTAMP_LABELS,
  SECTION_GRID_CLASSES,
  SECTION_TYPES,
} from '../../contactsDetailView.constants.ts';
import type { ContactFieldSection } from '../../contactsDetailView.types.ts';

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="mt-1 text-base break-words text-gray-900">{children}</dd>
    </div>
  );
}

/** One section's items: a field's value ("—" when empty), or a formatted timestamp. */
function SectionItems({ section, contact }: { section: ContactFieldSection; contact: Contact }) {
  if (section.type === SECTION_TYPES.TIMESTAMPS) {
    return section.fields.map((field) => (
      <Item key={field} label={CONTACT_TIMESTAMP_LABELS[field]}>
        <time dateTime={contact[field]}>{formatDateTime(contact[field])}</time>
      </Item>
    ));
  }
  return section.fields.map((field) => (
    <Item key={field} label={CONTACT_FIELD_CONFIG[field].label}>
      {contact[field] ?? <EmptyValue />}
    </Item>
  ));
}

/** View mode: every section, each as a grid of label + value. */
export function ContactDetailsView({ contact }: { contact: Contact }) {
  return (
    <div className="space-y-5">
      {CONTACT_FIELD_SECTIONS.map((section) => (
        <dl key={section.key} className={SECTION_GRID_CLASSES[section.columns]}>
          <SectionItems section={section} contact={contact} />
        </dl>
      ))}
    </div>
  );
}
