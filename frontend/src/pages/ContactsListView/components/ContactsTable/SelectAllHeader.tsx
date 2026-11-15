import { Checkbox } from '../../../../components/Checkbox';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';

interface SelectAllHeaderProps {
  /** Every row on the page is selected. */
  checked: boolean;
  /** Some, but not all, rows are selected: shows the dash. */
  indeterminate: boolean;
  disabled: boolean;
  onToggle: () => void;
}

/** Header cell of the checkbox column: selects or clears every row on the current page. */
export function SelectAllHeader({ checked, indeterminate, disabled, onToggle }: SelectAllHeaderProps) {
  return (
    <th scope="col" className="px-4 py-3 text-left">
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onChange={onToggle}
        aria-label={LIST_VIEW_TEXT.SELECTION.SELECT_ALL_ARIA_LABEL}
      />
    </th>
  );
}
