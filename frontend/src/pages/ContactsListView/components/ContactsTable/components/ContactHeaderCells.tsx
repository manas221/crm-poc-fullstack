import { Checkbox } from '../../../../../components/Checkbox';
import type { ContactSort } from '../../../../../types/api.ts';
import { CONTACT_SORT_KEYS, CONTACT_TABLE_COLUMN_LABELS, LIST_VIEW_TEXT } from '../../../contactsListView.constants.ts';
import type { ContactHeaderCellProps } from '../../../contactsListView.types.ts';
import { SortableHeader } from './SortableHeader.tsx';

// The header cell components referenced from COLUMNS (columns.ts). Each renders its whole <th>.

/** A plain, non-sortable header: just the column's label. */
export function LabelHeader({ columnKey }: ContactHeaderCellProps) {
  return (
    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
      {CONTACT_TABLE_COLUMN_LABELS[columnKey]}
    </th>
  );
}

/** The checkbox column's header: selects or clears every row on the current page. */
export function SelectAllHeader({
  isAllSelected,
  isSomeSelected,
  isSelectAllDisabled,
  onToggleAllRows,
}: ContactHeaderCellProps) {
  return (
    <th scope="col" className="px-4 py-3 text-left">
      <Checkbox
        checked={isAllSelected}
        indeterminate={isSomeSelected}
        disabled={isSelectAllDisabled}
        onChange={onToggleAllRows}
        aria-label={LIST_VIEW_TEXT.SELECTION.SELECT_ALL_ARIA_LABEL}
      />
    </th>
  );
}

/** The column's label as a sort button for `sortKey` (the backend allowlists name and createdAt). */
function SortHeader({ columnKey, sort, order, onSort, sortKey }: ContactHeaderCellProps & { sortKey: ContactSort }) {
  return (
    <SortableHeader
      label={CONTACT_TABLE_COLUMN_LABELS[columnKey]}
      activeOrder={sortKey === sort ? order : null}
      onSort={() => onSort(sortKey)}
    />
  );
}

export function NameHeader(props: ContactHeaderCellProps) {
  return <SortHeader {...props} sortKey={CONTACT_SORT_KEYS.NAME} />;
}

export function CreatedAtHeader(props: ContactHeaderCellProps) {
  return <SortHeader {...props} sortKey={CONTACT_SORT_KEYS.CREATED_AT} />;
}
