/**
 * Escapes LIKE/ILIKE wildcards so user input matches literally: "100%" must not mean
 * "100 followed by anything". Backslash is Postgres's default LIKE escape character.
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
