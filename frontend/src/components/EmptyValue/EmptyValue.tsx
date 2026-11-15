const SCREEN_READER_TEXT = 'None';

/** The "—" shown for a missing value (email, phone, company, tags…). Screen readers hear "None". */
export function EmptyValue() {
  return (
    <span className="text-gray-400">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{SCREEN_READER_TEXT}</span>
    </span>
  );
}
