import type { ReactNode } from 'react';
import type { Contact, ContactSort, SortOrder } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import {
  CONTACT_TABLE_COLUMN_KEYS,
  CONTACT_TABLE_COLUMN_LABELS,
  LIST_VIEW_STATUS,
  LIST_VIEW_TEXT,
} from '../../contactsListView.constants.ts';
import { COLUMNS } from './columns.ts';
import { ContactRow } from './ContactRow.tsx';
import { SelectAllHeader } from './SelectAllHeader.tsx';
import { SkeletonRows } from './SkeletonRows.tsx';
import { SortableHeader } from './SortableHeader.tsx';

/** What the table body shows. Built by useContactsListView from the query state. */
export type ContactsTableData =
  | { status: typeof LIST_VIEW_STATUS.LOADING; rowCount: number }
  | { status: typeof LIST_VIEW_STATUS.ERROR }
  | { status: typeof LIST_VIEW_STATUS.EMPTY }
  | { status: typeof LIST_VIEW_STATUS.READY; contacts: Contact[]; isUpdating: boolean };

interface ContactsTableProps {
  data: ContactsTableData;
  /** Rendered inside the table when there are no rows (no results / no contacts yet). */
  emptyState: ReactNode;
  sort: ContactSort;
  order: SortOrder;
  onSort: (sort: ContactSort) => void;
  /** Checked rows of the current page. */
  selectedIds: ReadonlySet<number>;
  onToggleRow: (id: number) => void;
  /** The header checkbox: selects every row on the page, or clears them when all are selected. */
  onToggleAllRows: () => void;
  /** E.g. while a tag is being assigned to the selection: the checkboxes can't change. */
  isSelectionLocked: boolean;
}

export function ContactsTable({
  data,
  emptyState,
  sort,
  order,
  onSort,
  selectedIds,
  onToggleRow,
  onToggleAllRows,
  isSelectionLocked,
}: ContactsTableProps) {
  const isUpdating = data.status === LIST_VIEW_STATUS.READY && data.isUpdating;
  const isBusy = data.status === LIST_VIEW_STATUS.LOADING || isUpdating;
  const rowCount = data.status === LIST_VIEW_STATUS.READY ? data.contacts.length : 0;
  const allSelected = rowCount > 0 && selectedIds.size === rowCount;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[960px] table-fixed border-collapse text-sm" aria-busy={isBusy}>
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.key} className={column.width} />
          ))}
        </colgroup>
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            {COLUMNS.map(({ key, sortKey }) =>
              key === CONTACT_TABLE_COLUMN_KEYS.CHECKBOX ? (
                <SelectAllHeader
                  key={key}
                  checked={allSelected}
                  indeterminate={selectedIds.size > 0 && !allSelected}
                  disabled={rowCount === 0 || isUpdating || isSelectionLocked}
                  onToggle={onToggleAllRows}
                />
              ) : sortKey ? (
                <SortableHeader
                  key={key}
                  label={CONTACT_TABLE_COLUMN_LABELS[key]}
                  activeOrder={sortKey === sort ? order : null}
                  onSort={() => onSort(sortKey)}
                />
              ) : (
                <th key={key} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  {CONTACT_TABLE_COLUMN_LABELS[key]}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody
          className={cn(
            'divide-y divide-gray-100',
            // Previous page stays visible, dimmed, while the next one loads.
            isUpdating && 'opacity-60 transition-opacity',
          )}
        >
          {data.status === LIST_VIEW_STATUS.LOADING && <SkeletonRows count={data.rowCount} />}
          {data.status === LIST_VIEW_STATUS.READY &&
            data.contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                isSelected={selectedIds.has(contact.id)}
                isSelectionDisabled={isUpdating || isSelectionLocked}
                onToggleSelected={() => onToggleRow(contact.id)}
              />
            ))}
          {data.status === LIST_VIEW_STATUS.EMPTY && (
            <tr>
              <td colSpan={COLUMNS.length}>{emptyState}</td>
            </tr>
          )}
          {data.status === LIST_VIEW_STATUS.ERROR && (
            // The error banner above explains it; the body stays empty, as in the mockup.
            <tr>
              <td colSpan={COLUMNS.length} className="h-64" />
            </tr>
          )}
        </tbody>
      </table>
      {data.status === LIST_VIEW_STATUS.LOADING && (
        <p role="status" className="sr-only">
          {LIST_VIEW_TEXT.TABLE.LOADING}
        </p>
      )}
    </div>
  );
}
