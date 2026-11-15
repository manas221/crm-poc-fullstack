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

// "2 min ago" / "3 hr ago" (short), "Yesterday" / "3 days ago", "1 week ago" (long, so not
// "last wk"). Matches the mockups' activity feed.
const shortRelative = new Intl.RelativeTimeFormat('en-GB', { style: 'short', numeric: 'always' });
const dayRelative = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
const longRelative = new Intl.RelativeTimeFormat('en-GB', { numeric: 'always' });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** How long ago `iso` was: "Just now", "2 min ago", "Yesterday", "1 week ago"… */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const elapsed = Math.max(0, now - new Date(iso).getTime());
  if (elapsed < MINUTE) {
    return 'Just now';
  }
  if (elapsed < HOUR) {
    return shortRelative.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  if (elapsed < DAY) {
    return shortRelative.format(-Math.floor(elapsed / HOUR), 'hour');
  }
  const days = Math.floor(elapsed / DAY);
  if (days < 7) {
    return capitalize(dayRelative.format(-days, 'day'));
  }
  if (days < 30) {
    return longRelative.format(-Math.floor(days / 7), 'week');
  }
  if (days < 365) {
    return longRelative.format(-Math.floor(days / 30), 'month');
  }
  return longRelative.format(-Math.floor(days / 365), 'year');
}
