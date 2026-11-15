import { CONTACT_TABLE_COLUMN_KEYS } from '../../contactsListView.constants.ts';
import type { ContactTableColumn } from '../../contactsListView.types.ts';

// One list of columns drives the header, the rows and the skeleton, so they always line up.
// Widths are fixed (table-fixed) so long values truncate instead of stretching the table.
// Header text comes from CONTACT_TABLE_COLUMN_LABELS.

export const COLUMNS: readonly ContactTableColumn[] = [
  { key: CONTACT_TABLE_COLUMN_KEYS.NAME, width: 'w-[17%]' },
  { key: CONTACT_TABLE_COLUMN_KEYS.EMAIL, width: 'w-[19%]' },
  { key: CONTACT_TABLE_COLUMN_KEYS.PHONE, width: 'w-[14%]' },
  { key: CONTACT_TABLE_COLUMN_KEYS.COMPANY, width: 'w-[17%]' },
  { key: CONTACT_TABLE_COLUMN_KEYS.TAGS, width: 'w-[20%]' },
  { key: CONTACT_TABLE_COLUMN_KEYS.CREATED_AT, width: 'w-[13%]' },
];
