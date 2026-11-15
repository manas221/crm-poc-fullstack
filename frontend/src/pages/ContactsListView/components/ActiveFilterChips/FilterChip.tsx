import { XIcon } from '../../../../components/icons';
import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

/** "Company: Acme Corp ×" — one applied filter value, removable on its own. */
export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 py-1 pr-1.5 pl-3 text-sm text-gray-700">
      <span className="max-w-60 truncate">
        {label}: <strong className="font-semibold text-gray-900">{value}</strong>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={LIST_VIEW_TEXT.FILTERS.CHIPS.REMOVE_ARIA_LABEL(label, value)}
        className="rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        <XIcon className="size-3.5" />
      </button>
    </li>
  );
}
