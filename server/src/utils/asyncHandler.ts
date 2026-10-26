import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, fromDatabaseError, type DatabaseErrorLike } from './errors';
import type { Logger } from './logger';

/** Wrap async handlers so rejected promises reach the Express error handler. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

/** Throw a safe application error if Supabase returned an error object. */
export function assertNoDbError(
  error: DatabaseErrorLike | null,
  logger: Logger,
  context: string
): void {
  if (!error) return;
  logger.error('Database operation failed', {
    context,
    code: error.code,
    message: error.message
  });
  throw fromDatabaseError(error, context);
}

export function zodDetails(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '_root',
    message: issue.message
  }));
}

/** Express error handler - consistent JSON errors, no stack traces or secrets. */
export function errorHandler(logger: Logger) {
  return (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = res.locals.requestId as string | undefined;

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the highlighted fields.',
          details: zodDetails(error)
        },
        ...(requestId ? { requestId } : {})
      });
      return;
    }

    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        logger.error('Application error', {
          requestId,
          path: req.path,
          method: req.method,
          code: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        logger.warn('Request rejected', {
          requestId,
          path: req.path,
          method: req.method,
          status: error.statusCode,
          code: error.code
        });
      }
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.expose ? error.message : 'An unexpected error occurred.',
          ...(error.expose && error.details !== undefined ? { details: error.details } : {})
        },
        ...(requestId ? { requestId } : {})
      });
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' },
        ...(requestId ? { requestId } : {})
      });
      return;
    }

    if (error && typeof error === 'object') {
      const err = error as { type?: string; name?: string };
      if (err.type === 'entity.too.large') {
        res.status(413).json({
          success: false,
          error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' },
          ...(requestId ? { requestId } : {})
        });
        return;
      }
      if (err.name === 'MulterError') {
        res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: 'The upload is invalid. Use one image up to 5 MB.'
          },
          ...(requestId ? { requestId } : {})
        });
        return;
      }
    }

    logger.error('Unhandled error', {
      requestId,
      path: req.path,
      method: req.method,
      error: error instanceof Error ? error.message : String(error)
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      },
      ...(requestId ? { requestId } : {})
    });
  };
}
