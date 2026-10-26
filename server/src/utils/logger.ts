import { env } from '../config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const sensitiveKeys = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'secret',
  'api_key',
  'email',
  'phone',
  'message',
  'project_description',
  'internal_notes'
]);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redact(item, depth + 1));
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    output[key] = sensitiveKeys.has(key.toLowerCase()) ? '[redacted]' : redact(item, depth + 1);
  }
  return output;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(meta: Record<string, unknown>): Logger;
}

function write(level: Level, message: string, meta: Record<string, unknown>, bound: Record<string, unknown>) {
  if (levelOrder[level] < levelOrder[env.LOG_LEVEL]) return;
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...bound,
    ...(redact(meta) as Record<string, unknown>)
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export function createLogger(bound: Record<string, unknown> = {}): Logger {
  return {
    debug: (message, meta = {}) => write('debug', message, meta, bound),
    info: (message, meta = {}) => write('info', message, meta, bound),
    warn: (message, meta = {}) => write('warn', message, meta, bound),
    error: (message, meta = {}) => write('error', message, meta, bound),
    child: (meta) => createLogger({ ...bound, ...meta })
  };
}

export const logger = createLogger({ service: 'kilsta-api' });
