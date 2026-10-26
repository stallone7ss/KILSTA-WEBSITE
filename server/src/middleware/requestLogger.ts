import type { RequestHandler } from 'express';
import type { Logger } from '../utils/logger';

/**
 * Logs request metadata only. Query strings, bodies, emails, phone numbers and
 * message content are deliberately excluded.
 */
export function requestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      logger.info('HTTP request', {
        requestId: res.locals.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Math.round(durationMs)
      });
    });
    next();
  };
}
