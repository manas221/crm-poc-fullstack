// Formatting is fixed (not the browser's locale) so the UI matches the mockups everywhere:
// "50,000", and dates like "13 Nov 2026".

const numberFormat = new Intl.NumberFormat('en-GB');

// en-GB would give "13 Sept 2026"; en-US month names are always three letters. The parts are
// put together in day-month-year order ourselves.
const dateParts = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** "2026-09-13T10:42:00.000Z" → "13 Sep 2026", in the viewer's time zone. */
export function formatDate(iso: string): string {
  const parts = dateParts.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('day')} ${part('month')} ${part('year')}`;
}

/** "2026-11-12T10:42:00.000Z" → "12 Nov 2026, 10:42" (24-hour), in the viewer's time zone. */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${timeFormat.format(new Date(iso))}`;
}
