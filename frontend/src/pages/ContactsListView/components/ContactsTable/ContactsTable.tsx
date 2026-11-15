import type { ReactNode } from 'react';
import type { Contact } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import { CONTACT_TABLE_COLUMN_LABELS, LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';
import { COLUMNS } from './columns.ts';
import { ContactRow } from './ContactRow.tsx';
import { SkeletonRows } from './SkeletonRows.tsx';

/** What the table body shows. Built by useContactsListView from the query state. */
export type ContactsTableData =
  | { status: 'loading'; rowCount: number }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'ready'; contacts: Contact[]; isUpdating: boolean };

interface ContactsTableProps {
  data: ContactsTableData;
  /** Rendered inside the table when there are no rows (no results / no contacts yet). */
  emptyState: ReactNode;
}

export function ContactsTable({ data, emptyState }: ContactsTableProps) {
  const isBusy = data.status === 'loading' || (data.status === 'ready' && data.isUpdating);

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
            {COLUMNS.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                {CONTACT_TABLE_COLUMN_LABELS[column.key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={cn(
            'divide-y divide-gray-100',
            // Previous page stays visible, dimmed, while the next one loads.
            data.status === 'ready' && data.isUpdating && 'opacity-60 transition-opacity',
          )}
        >
          {data.status === 'loading' && <SkeletonRows count={data.rowCount} />}
          {data.status === 'ready' && data.contacts.map((contact) => <ContactRow key={contact.id} contact={contact} />)}
          {data.status === 'empty' && (
            <tr>
              <td colSpan={COLUMNS.length}>{emptyState}</td>
            </tr>
          )}
          {data.status === 'error' && (
            // The error banner above explains it; the body stays empty, as in the mockup.
            <tr>
              <td colSpan={COLUMNS.length} className="h-64" />
            </tr>
          )}
        </tbody>
      </table>
      {data.status === 'loading' && (
        <p role="status" className="sr-only">
          {LIST_VIEW_TEXT.TABLE.LOADING}
        </p>
      )}
    </div>
  );
}
