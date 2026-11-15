// Fixed to en-GB (not the browser's locale) so the UI matches the mockups everywhere:
// "50,000", and dates like "13 Nov 2026".
const LOCALE = 'en-GB';

const numberFormat = new Intl.NumberFormat(LOCALE);

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}
