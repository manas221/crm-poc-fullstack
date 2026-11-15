import type { ContactSort, ListContactsParams } from '../../types/api.ts';
import type { CONTACT_TABLE_COLUMN_KEYS, LIST_VIEW_ACTION_TYPES } from './contactsListView.constants.ts';

/** The list's search, filters, sort and page, as read from the URL. Sort and order are always set. */
export type ListParams = ListContactsParams & Required<Pick<ListContactsParams, 'sort' | 'order'>>;

export type ListViewActionType = (typeof LIST_VIEW_ACTION_TYPES)[keyof typeof LIST_VIEW_ACTION_TYPES];

export type ListAction =
  | { type: typeof LIST_VIEW_ACTION_TYPES.SEARCH; q: string }
  | { type: typeof LIST_VIEW_ACTION_TYPES.SORT; sort: ContactSort }
  | { type: typeof LIST_VIEW_ACTION_TYPES.CLEAR_FILTERS };

export type ContactTableColumnKey = (typeof CONTACT_TABLE_COLUMN_KEYS)[keyof typeof CONTACT_TABLE_COLUMN_KEYS];

export interface ContactTableColumn {
  key: ContactTableColumnKey;
  /** Tailwind width class for the <col>; the table is table-fixed. */
  width: string;
  /** The API sort this column's header applies. Columns without one aren't sortable. */
  sortKey?: ContactSort;
}
