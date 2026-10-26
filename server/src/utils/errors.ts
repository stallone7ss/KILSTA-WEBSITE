export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = statusCode < 500;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'BAD_REQUEST', message, details);

export const unauthorized = (message = 'Authentication is required.') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'You do not have permission to perform this action.') =>
  new AppError(403, 'FORBIDDEN', message);

export const notFound = (message = 'The requested resource was not found.') =>
  new AppError(404, 'NOT_FOUND', message);

export const conflict = (message: string, details?: unknown) =>
  new AppError(409, 'CONFLICT', message, details);

export const unprocessable = (message: string, details?: unknown) =>
  new AppError(422, 'UNPROCESSABLE_ENTITY', message, details);

export const tooManyRequests = (message = 'Too many requests. Please try again later.') =>
  new AppError(429, 'RATE_LIMITED', message);

export const serviceUnavailable = (
  message = 'A required service is not configured or is temporarily unavailable.'
) => new AppError(503, 'SERVICE_UNAVAILABLE', message);

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

export type DatabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

/**
 * Convert a Supabase/Postgres error into a safe application error.
 * Raw database messages are logged but never returned to the browser.
 */
export function fromDatabaseError(error: DatabaseErrorLike | null, context: string): AppError {
  if (!error) return new AppError(500, 'DATABASE_ERROR', 'The database operation failed.');
  if (error.code === '23505') {
    return conflict('A record with those unique details already exists.');
  }
  if (error.code === '23503') {
    return unprocessable('A referenced record does not exist or is still in use.');
  }
  if (error.code === '23514') {
    return unprocessable('The submitted values are not permitted.');
  }
  if (error.code === 'PGRST116') {
    return notFound();
  }
  return new AppError(500, 'DATABASE_ERROR', 'The database operation failed.', { context });
}
