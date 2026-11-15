import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from '../../../../components/icons';
import type { SortOrder } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import { SORT_ORDER } from '../../contactsListView.constants.ts';

interface SortableHeaderProps {
  label: string;
  /** This column's direction when it's the active sort, otherwise null. */
  activeOrder: SortOrder | null;
  onSort: () => void;
}

/**
 * A header cell whose label is a button. aria-sort on the <th> tells screen readers which
 * column the table is sorted by and in which direction (the standard ARIA sortable-table
 * pattern), so the button itself needs no extra label.
 */
export function SortableHeader({ label, activeOrder, onSort }: SortableHeaderProps) {
  const ariaSort = activeOrder === null ? 'none' : activeOrder === SORT_ORDER.ASC ? 'ascending' : 'descending';
  const Icon = activeOrder === null ? ChevronUpDownIcon : activeOrder === SORT_ORDER.ASC ? ChevronUpIcon : ChevronDownIcon;

  return (
    <th scope="col" aria-sort={ariaSort} className="px-4 py-3 text-left font-semibold">
      <button
        type="button"
        onClick={onSort}
        className={cn(
          '-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-gray-900',
          'focus-visible:outline-2 focus-visible:outline-blue-600',
          activeOrder === null ? 'text-gray-600' : 'text-gray-900',
        )}
      >
        {label}
        <Icon className={cn('size-3.5', activeOrder === null ? 'text-gray-400' : 'text-blue-600')} />
      </button>
    </th>
  );
}
