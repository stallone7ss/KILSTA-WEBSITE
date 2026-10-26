import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/** Validate and replace req.body (unknown keys are stripped by Zod objects). */
export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/** Validate query strings and expose the parsed, typed result on res.locals.query. */
export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req, res, next) => {
    try {
      res.locals.query = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (req, res, next) => {
    try {
      res.locals.params = schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}
