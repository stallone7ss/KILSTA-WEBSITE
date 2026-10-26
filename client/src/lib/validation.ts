import { z } from 'zod';

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be no more than ${max} characters.`);

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be no more than ${max} characters.`).optional();

const email = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address.');

const phone = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number.')
  .max(30, 'Phone number is too long.')
  .regex(/^[0-9+()\s.-]+$/, 'Phone number contains invalid characters.');

const optionalPhone = z
  .string()
  .trim()
  .max(30, 'Phone number is too long.')
  .regex(/^[0-9+()\s.-]*$/, 'Phone number contains invalid characters.')
  .optional();

function dateError(value: string | undefined): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter a valid date.';
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return 'Enter a valid date.';
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const latest = new Date(today);
  latest.setUTCFullYear(latest.getUTCFullYear() + 2);
  if (date < today) return 'Choose a date in the future.';
  if (date > latest) return 'Choose a date within the next two years.';
  return null;
}

const preferredDate = z
  .string()
  .optional()
  .superRefine((value, ctx) => {
    const error = dateError(value);
    if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  });

const consent = z
  .boolean()
  .refine((value) => value === true, 'Please confirm that we may contact you about this request.');

export const quoteFormSchema = z.object({
  fullName: trimmed(2, 120, 'Full name'),
  organization: optionalText(160, 'Organization'),
  email,
  phone,
  serviceCategory: z.enum(['business', 'ict', 'training'], {
    errorMap: () => ({ message: 'Choose a service category.' })
  }),
  requestedService: trimmed(2, 160, 'Requested service'),
  projectDescription: trimmed(20, 4000, 'Project description'),
  preferredContactMethod: z.enum(['email', 'phone'], {
    errorMap: () => ({ message: 'Choose how you would like to be contacted.' })
  }),
  budgetRange: optionalText(80, 'Budget range'),
  preferredCompletionDate: preferredDate,
  contactConsent: consent,
  website: z.string().max(0, 'Submission rejected.').optional()
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export const contactFormSchema = z.object({
  fullName: trimmed(2, 120, 'Full name'),
  email,
  phone: optionalPhone,
  organization: optionalText(160, 'Organization'),
  subject: trimmed(3, 160, 'Subject'),
  message: trimmed(10, 4000, 'Message'),
  contactConsent: consent,
  website: z.string().max(0, 'Submission rejected.').optional()
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const registrationFormSchema = z.object({
  courseId: z.string().min(1, 'Choose a course.'),
  fullName: trimmed(2, 120, 'Full name'),
  email,
  phone,
  organization: optionalText(160, 'Organization'),
  preferredStartDate: preferredDate,
  message: z.string().trim().max(2000, 'Message must be no more than 2000 characters.').optional(),
  contactConsent: consent,
  website: z.string().max(0, 'Submission rejected.').optional()
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(200)
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Use at least 10 characters.')
      .max(128, 'Password is too long.')
      .regex(/[A-Za-z]/, 'Include at least one letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.'
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const productFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().max(80).optional()
});
