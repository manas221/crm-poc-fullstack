export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'VERSION_CONFLICT'
  | 'EMAIL_TAKEN'
  | 'INTERNAL_ERROR';

/** An error that is safe to show the client. Anything else becomes INTERNAL_ERROR. */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (message: string, details?: unknown) => new AppError('NOT_FOUND', 404, message, details);
