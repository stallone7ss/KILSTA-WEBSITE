import { z } from 'zod';
import {
  consentSchema,
  emailSchema,
  futureDateSchema,
  honeypotSchema,
  optionalPhoneSchema,
  optionalText,
  phoneSchema,
  trimmedString
} from './common';

export const serviceCategorySchema = z.enum(['business', 'ict', 'training'], {
  errorMap: () => ({ message: 'Choose a valid service category.' })
});

export const quoteRequestSchema = z.object({
  fullName: trimmedString(2, 120, 'Full name'),
  organization: optionalText(160, 'Organization'),
  email: emailSchema,
  phone: phoneSchema,
  serviceCategory: serviceCategorySchema,
  requestedService: trimmedString(2, 160, 'Requested service'),
  projectDescription: trimmedString(20, 4000, 'Project description'),
  preferredContactMethod: z.enum(['email', 'phone'], {
    errorMap: () => ({ message: 'Choose how you would like to be contacted.' })
  }),
  budgetRange: optionalText(80, 'Budget range'),
  preferredCompletionDate: futureDateSchema(),
  contactConsent: consentSchema,
  website: honeypotSchema
});

export const contactMessageSchema = z.object({
  fullName: trimmedString(2, 120, 'Full name'),
  email: emailSchema,
  phone: optionalPhoneSchema,
  organization: optionalText(160, 'Organization'),
  subject: trimmedString(3, 160, 'Subject'),
  message: trimmedString(10, 4000, 'Message'),
  contactConsent: consentSchema,
  website: honeypotSchema
});

export const courseRegistrationSchema = z.object({
  courseId: z.string().uuid('Choose a valid course.'),
  fullName: trimmedString(2, 120, 'Full name'),
  email: emailSchema,
  phone: phoneSchema,
  organization: optionalText(160, 'Organization'),
  preferredStartDate: futureDateSchema(),
  message: optionalText(2000, 'Message'),
  contactConsent: consentSchema,
  website: honeypotSchema
});

export const publicIdSchema = z.object({
  id: z.string().uuid('Invalid identifier.')
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type CourseRegistrationInput = z.infer<typeof courseRegistrationSchema>;
