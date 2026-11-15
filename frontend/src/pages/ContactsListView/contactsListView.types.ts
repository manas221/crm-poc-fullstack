import type { ComponentType } from 'react';
import type { Contact, ContactSort, ListContactsParams, SortOrder } from '../../types/api.ts';
import type {
  CONTACT_TABLE_COLUMN_KEYS,
  BULK_ASSIGN_STATUS,
  LIST_VIEW_ACTION_TYPES,
  ROW_SELECTION_ACTION_TYPES,
} from './contactsListView.constants.ts';

/** The list's search, filters, sort and page, as read from the URL. Sort and order are always set. */
export type ListParams = ListContactsParams & Required<Pick<ListContactsParams, 'sort' | 'order'>>;

export type ListViewActionType = (typeof LIST_VIEW_ACTION_TYPES)[keyof typeof LIST_VIEW_ACTION_TYPES];

export type ListAction =
  | { type: typeof LIST_VIEW_ACTION_TYPES.SEARCH; q: string }
  | { type: typeof LIST_VIEW_ACTION_TYPES.SORT; sort: ContactSort }
  | { type: typeof LIST_VIEW_ACTION_TYPES.CLEAR_FILTERS }
  /** `undefined` removes the company filter. */
  | { type: typeof LIST_VIEW_ACTION_TYPES.COMPANY; company: string | undefined }
  /** The full new selection; `[]` removes the tags filter. */
  | { type: typeof LIST_VIEW_ACTION_TYPES.TAGS; tags: number[] }
  | { type: typeof LIST_VIEW_ACTION_TYPES.PAGE; page: number }
  | { type: typeof LIST_VIEW_ACTION_TYPES.LIMIT; limit: number };

export type RowSelectionAction =
  | { type: typeof ROW_SELECTION_ACTION_TYPES.TOGGLE; id: number }
  /** Adds `ids` to the selection (the "select all on this page" checkbox). */
  | { type: typeof ROW_SELECTION_ACTION_TYPES.SELECT_MANY; ids: number[] }
  | { type: typeof ROW_SELECTION_ACTION_TYPES.CLEAR };

/** Selected contact ids, tagged with the list query they were picked in (see useRowSelection). */
export interface RowSelectionState {
  scopeKey: string;
  ids: ReadonlySet<number>;
}

/** The last "Assign tag" request, for the selection bar. Built by useContactsListView. */
export type BulkAssignData =
  | { status: typeof BULK_ASSIGN_STATUS.IDLE }
  | { status: typeof BULK_ASSIGN_STATUS.PENDING }
  | { status: typeof BULK_ASSIGN_STATUS.SUCCESS; message: string }
  /** `canRetry` is false when retrying can't help (the tag is gone: pick another one). */
  | { status: typeof BULK_ASSIGN_STATUS.ERROR; message: string; canRetry: boolean };

export type ContactTableColumnKey = (typeof CONTACT_TABLE_COLUMN_KEYS)[keyof typeof CONTACT_TABLE_COLUMN_KEYS];

/** What every body cell gets: its row's contact and selection state (only some cells use the latter). */
export interface ContactCellProps {
  contact: Contact;
  isSelected: boolean;
  /** While the next page loads, these rows are the old page's: don't let them be picked. */
  isSelectionDisabled: boolean;
  onToggleSelected: () => void;
}

/** What every header cell gets: the table's sort and select-all state (each uses what it needs). */
export interface ContactHeaderCellProps {
  /** The column's own key: plain headers show its label. */
  columnKey: ContactTableColumnKey;
  sort: ContactSort;
  order: SortOrder;
  onSort: (sort: ContactSort) => void;
  /** Every row on the page is selected. */
  isAllSelected: boolean;
  /** Some, but not all, rows are selected: the select-all checkbox shows a dash. */
  isSomeSelected: boolean;
  isSelectAllDisabled: boolean;
  onToggleAllRows: () => void;
}

export interface ContactTableColumn {
  key: ContactTableColumnKey;
  /** Tailwind width class for the <col>; the table is table-fixed. */
  width: string;
  /** Renders this column's whole <th> (a label, a sort button or the select-all checkbox). */
  Header: ComponentType<ContactHeaderCellProps>;
  /** Renders this column's whole <td> for one row (each cell styles its own <td>). */
  Cell: ComponentType<ContactCellProps>;
}
