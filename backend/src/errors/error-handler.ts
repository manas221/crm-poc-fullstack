import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';
import { AppError, notFound } from './app-error.js';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

/** Errors thrown by express.json() (body-parser) carry an HTTP status and a type. */
interface HttpParserError {
  status: number;
  type?: string;
  expose?: boolean;
}

function isHttpParserError(err: unknown): err is HttpParserError {
  return typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number';
}

function toResponse(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof AppError) {
    return { status: err.status, body: { error: { code: err.code, message: err.message, details: err.details } } };
  }

  if (err instanceof z.ZodError) {
    return {
      status: 400,
      body: { error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: z.flattenError(err) } },
    };
  }

  if (isHttpParserError(err) && err.expose && err.status >= 400 && err.status < 500) {
    const malformedJson = err.type === 'entity.parse.failed';
    return {
      status: err.status,
      body: {
        error: malformedJson
          ? { code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON' }
          : { code: 'BAD_REQUEST', message: 'Request could not be processed' },
      },
    };
  }

  return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } } };
}

/** Registered after all routes: unknown paths get the standard JSON 404, not Express's HTML page. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`Route ${req.method} ${req.path} not found`));
};

/** The one place errors become HTTP responses. Stack traces are logged, never sent. */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const { status, body } = toResponse(err);
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }
  res.status(status).json(body);
};
