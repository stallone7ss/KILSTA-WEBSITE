import type { CorsOptions } from 'cors';
import type { AppConfig } from './env';

/**
 * Explicit allow-list. Credentialed CORS is never opened with a wildcard.
 * Development origins are added only outside production.
 */
export function getAllowedOrigins(config: AppConfig): string[] {
  const origins = new Set<string>();
  origins.add(config.FRONTEND_URL.replace(/\/$/, ''));
  config.additionalOrigins.forEach((origin) => origins.add(origin));

  if (!config.isProduction) {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
    origins.add('http://localhost:4173');
    origins.add('http://127.0.0.1:4173');
  }
  return [...origins];
}

export function buildCorsOptions(config: AppConfig): CorsOptions {
  const allowed = getAllowedOrigins(config);

  return {
    origin(origin, callback) {
      // Requests without an Origin header (server-to-server, curl, health checks)
      // are not browser CORS requests.
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowed.includes(normalized)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600
  };
}
