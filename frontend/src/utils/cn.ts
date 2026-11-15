/** Joins class names, skipping falsy ones: cn('px-2', isActive && 'bg-blue-50'). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
