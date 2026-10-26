import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Role } from '../config/permissions';
import { hasPermission, permissionsForRoles, type Permission } from '../config/permissions';
import type { AuthGateway } from '../services/auth.service';
import { forbidden, unauthorized } from '../utils/errors';

export interface AuthContext {
  user: { id: string; email: string };
  roles: Role[];
  permissions: Permission[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Verify the Supabase access token on every protected request. Roles are loaded
 * from the database, never from the client payload or token claims.
 */
export function authenticate(auth: AuthGateway): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        throw unauthorized('A valid access token is required.');
      }
      const token = header.slice('Bearer '.length).trim();
      if (!token || token.length > 8192) {
        throw unauthorized('A valid access token is required.');
      }

      const user = await auth.verifyAccessToken(token);
      if (!user) {
        throw unauthorized('Your session is invalid or has expired. Please sign in again.');
      }

      const roles = await auth.getRoles(user.id);
      req.auth = {
        user,
        roles,
        permissions: permissionsForRoles(roles)
      };
      res.locals.authUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireStaff(): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) return next(unauthorized());
    if (!req.auth.roles.includes('admin') && !req.auth.roles.includes('staff')) {
      return next(forbidden('Your account does not have staff access.'));
    }
    return next();
  };
}

export function requireRole(role: Role): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) return next(unauthorized());
    if (!req.auth.roles.includes(role)) {
      return next(forbidden(`This action requires the ${role} role.`));
    }
    return next();
  };
}

export function requirePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) return next(unauthorized());
    if (!hasPermission(req.auth.roles, permission)) {
      return next(forbidden('You do not have permission to perform this action.'));
    }
    return next();
  };
}
