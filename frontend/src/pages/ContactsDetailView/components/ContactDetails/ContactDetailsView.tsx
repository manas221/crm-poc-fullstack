import type { ReactNode } from 'react';
import { EmptyValue } from '../../../../components/EmptyValue';
import type { Contact } from '../../../../types/api.ts';
import { formatDateTime } from '../../../../utils/format.ts';
import { CONTACT_FIELD_KEYS, CONTACT_FIELD_LABELS, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';

const { FIRST_NAME, LAST_NAME, EMAIL, PHONE, COMPANY } = CONTACT_FIELD_KEYS;

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="mt-1 text-base break-words text-gray-900">{children}</dd>
    </div>
  );
}

/** View mode: every field as label + value, with "—" for the empty ones. */
export function ContactDetailsView({ contact }: { contact: Contact }) {
  const { firstName, lastName, email, phone, company, createdAt, updatedAt } = contact;
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      <Item label={CONTACT_FIELD_LABELS[FIRST_NAME]}>{firstName}</Item>
      <Item label={CONTACT_FIELD_LABELS[LAST_NAME]}>{lastName}</Item>
      <Item label={CONTACT_FIELD_LABELS[EMAIL]}>{email ?? <EmptyValue />}</Item>
      <Item label={CONTACT_FIELD_LABELS[PHONE]}>{phone ?? <EmptyValue />}</Item>
      <Item label={CONTACT_FIELD_LABELS[COMPANY]}>{company ?? <EmptyValue />}</Item>
      {/* Keeps Created / Last updated on a row of their own, as in the mockup. */}
      <div className="hidden sm:block" aria-hidden="true" />
      <Item label={DETAIL_VIEW_TEXT.DETAILS.CREATED}>
        <time dateTime={createdAt}>{formatDateTime(createdAt)}</time>
      </Item>
      <Item label={DETAIL_VIEW_TEXT.DETAILS.LAST_UPDATED}>
        <time dateTime={updatedAt}>{formatDateTime(updatedAt)}</time>
      </Item>
    </dl>
  );
}
