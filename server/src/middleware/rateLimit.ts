import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { sendFailure } from '../utils/http';

export function rateLimiter(options: {
  windowMs: number;
  limit: number;
  message?: string;
}): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      sendFailure(
        res,
        429,
        'RATE_LIMITED',
        options.message ?? 'Too many requests. Please try again later.'
      );
    }
  });
}
