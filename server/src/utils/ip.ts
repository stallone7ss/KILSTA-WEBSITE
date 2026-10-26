import { createHash } from 'node:crypto';
import { env } from '../config/env';

/**
 * Audit logs keep a one-way hash of the request IP rather than the address.
 * Configure AUDIT_IP_SALT with a long random value in production.
 */
export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  const salt = env.AUDIT_IP_SALT ?? env.SUPABASE_SECRET_KEY ?? 'kilsta-local-audit';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}
