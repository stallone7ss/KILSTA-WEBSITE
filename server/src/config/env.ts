import 'dotenv/config';
import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().optional()
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().url().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ADDITIONAL_ALLOWED_ORIGINS: optionalString,

  SUPABASE_URL: optionalUrl,
  SUPABASE_PUBLISHABLE_KEY: optionalString,
  SUPABASE_SECRET_KEY: optionalString,
  SUPABASE_DB_URL: optionalString,

  EMAIL_PROVIDER: z.enum(['smtp', 'resend', 'none']).default('none'),
  EMAIL_FROM: z.string().min(3).default('KILSTA Business & ICT Consultants <no-reply@example.com>'),
  EMAIL_API_KEY: optionalString,
  ADMIN_NOTIFICATION_EMAIL: z.string().email().default('kilsta2023@gmail.com'),

  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),
  AUDIT_IP_SALT: optionalString
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = parsed.error.flatten().fieldErrors;
  // Never print secret values - only the names of invalid/missing variables.
  console.error('Invalid server environment configuration:', Object.keys(fields));
  throw new Error(`Invalid server environment configuration: ${Object.keys(fields).join(', ')}`);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  additionalOrigins: (parsed.data.ADDITIONAL_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
};

export type AppConfig = typeof env;

export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY);
}
