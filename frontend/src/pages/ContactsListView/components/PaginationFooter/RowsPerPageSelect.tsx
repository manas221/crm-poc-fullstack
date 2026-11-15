import { useId } from 'react';
import { ChevronDownIcon } from '../../../../components/icons';
import { PAGE_SIZE_OPTIONS } from '../../../../constants/list.ts';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';

interface RowsPerPageSelectProps {
  value: number;
  onChange: (limit: number) => void;
}

/** A native <select>: keyboard and screen reader support for free, styled to match the buttons. */
export function RowsPerPageSelect({ value, onChange }: RowsPerPageSelectProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-sm text-gray-600">
        {LIST_VIEW_TEXT.PAGINATION.ROWS_PER_PAGE}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}
