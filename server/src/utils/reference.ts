import { randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Human-readable, non-sequential reference. Uniqueness is still enforced by a
 * database constraint and callers retry on collision.
 * Example: KQ-2601-8F3K2M
 */
export function generateReference(prefix: 'KQ' | 'KR' | 'KC', now = new Date()): string {
  const year = String(now.getUTCFullYear()).slice(-2);
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${prefix}-${year}${month}-${suffix}`;
}
