import { LIST_VIEW_TEXT } from '../../contactsListView.constants.ts';

/** The "—" shown for a missing email, phone, company or tags. */
export function EmptyValue() {
  return (
    <span className="text-gray-400">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{LIST_VIEW_TEXT.TABLE.EMPTY_VALUE}</span>
    </span>
  );
}
