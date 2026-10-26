import { z } from 'zod';

export const trimmedString = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} is required.` })
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be no more than ${max} characters.`);

export const emailSchema = z
  .string({ required_error: 'Email address is required.' })
  .trim()
  .toLowerCase()
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address.');

export const phoneSchema = z
  .string({ required_error: 'Phone number is required.' })
  .trim()
  .min(7, 'Enter a valid phone number.')
  .max(30, 'Phone number is too long.')
  .regex(/^[0-9+()\s.-]+$/, 'Phone number contains invalid characters.');

export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, 'Phone number is too long.')
  .regex(/^[0-9+()\s.-]*$/, 'Phone number contains invalid characters.')
  .optional()
  .transform((value) => (value ? value : undefined));

export const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be no more than ${max} characters.`)
    .optional()
    .transform((value) => (value ? value : undefined));

/** Honeypot must remain empty. Bots fill every field they can see. */
export const honeypotSchema = z
  .string()
  .max(0, 'Submission rejected.')
  .optional()
  .transform(() => undefined);

export const consentSchema = z.literal(true, {
  errorMap: () => ({ message: 'Please confirm that we may contact you about this request.' })
});

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function futureDateSchema(options: { required?: boolean } = {}) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .superRefine((value, ctx) => {
      if (!value) {
        if (options.required) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A date is required.' });
        }
        return;
      }
      if (!isValidDateOnly(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid date.' });
        return;
      }
      const date = new Date(`${value}T00:00:00.000Z`);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const latest = new Date(today);
      latest.setUTCFullYear(latest.getUTCFullYear() + 2);
      if (date.getTime() < today.getTime()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Choose a date in the future.' });
      } else if (date.getTime() > latest.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Choose a date within the next two years.'
        });
      }
    });
}

export const optionalPastOrFutureDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .superRefine((value, ctx) => {
    if (value && !isValidDateOnly(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid date.' });
    }
  });
