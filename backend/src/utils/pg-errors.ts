/** The fields of a node-postgres error we look at. */
interface PgError {
  code: string;
  constraint?: string;
}

function isPgError(err: unknown): err is PgError {
  return typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string';
}

/** A unique violation (23505) on the given constraint or unique index. */
export function isUniqueViolation(err: unknown, constraint: string): boolean {
  return isPgError(err) && err.code === '23505' && err.constraint === constraint;
}
