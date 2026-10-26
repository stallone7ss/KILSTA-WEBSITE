import { describe, expect, it } from 'vitest';
import {
  contactFormSchema,
  forgotPasswordSchema,
  loginSchema,
  quoteFormSchema,
  registrationFormSchema,
  resetPasswordSchema
} from '../lib/validation';

function futureDate(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const validQuote = {
  fullName: 'Maria Kila',
  organization: 'Kila Trading',
  email: 'maria@example.com',
  phone: '+675 82545274',
  serviceCategory: 'business' as const,
  requestedService: 'Business plan review',
  projectDescription:
    'We need help reviewing an existing business plan before approaching a bank for finance.',
  preferredContactMethod: 'email' as const,
  budgetRange: 'PGK 5,000 - 10,000',
  preferredCompletionDate: futureDate(60),
  contactConsent: true,
  website: ''
};

describe('client quote form validation', () => {
  it('accepts a complete request', () => {
    const result = quoteFormSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
  });

  it('requires consent and a sufficiently detailed description', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      contactConsent: false,
      projectDescription: 'Too short'
    });
    expect(result.success).toBe(false);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('contactConsent');
    expect(paths).toContain('projectDescription');
  });

  it('rejects invalid contact details and dates', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      email: 'nope',
      phone: 'abc',
      preferredCompletionDate: '2020-01-01'
    });
    expect(result.success).toBe(false);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('email');
    expect(paths).toContain('phone');
    expect(paths).toContain('preferredCompletionDate');
  });

  it('rejects dates more than two years ahead', () => {
    const date = new Date();
    date.setUTCFullYear(date.getUTCFullYear() + 3);
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      preferredCompletionDate: date.toISOString().slice(0, 10)
    });
    expect(result.success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    const result = quoteFormSchema.safeParse({ ...validQuote, website: 'spam' });
    expect(result.success).toBe(false);
  });
});

describe('contact and registration form validation', () => {
  it('accepts a contact enquiry without a phone number', () => {
    const result = contactFormSchema.safeParse({
      fullName: 'John Gila',
      email: 'john@example.com',
      phone: '',
      organization: '',
      subject: 'Opening hours',
      message: 'Please confirm your opening hours and location in Alotau.',
      contactConsent: true,
      website: ''
    });
    expect(result.success).toBe(true);
  });

  it('requires a course, consent and valid phone for registration', () => {
    const result = registrationFormSchema.safeParse({
      courseId: '',
      fullName: 'Jane Doe',
      email: 'not-an-email',
      phone: 'x',
      contactConsent: false
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(
        expect.arrayContaining(['courseId', 'email', 'phone', 'contactConsent'])
      );
    }
  });
});

describe('authentication form validation', () => {
  it('validates login credentials', () => {
    expect(loginSchema.safeParse({ email: 'staff@example.com', password: 'secret' }).success).toBe(
      true
    );
    expect(loginSchema.safeParse({ email: 'bad', password: '' }).success).toBe(false);
  });

  it('validates password recovery email addresses', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'staff@example.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });

  it('requires a strong, matching reset password', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'longenough1', confirmPassword: 'longenough1' })
        .success
    ).toBe(true);

    const short = resetPasswordSchema.safeParse({
      password: 'short1',
      confirmPassword: 'short1'
    });
    expect(short.success).toBe(false);

    const mismatch = resetPasswordSchema.safeParse({
      password: 'longenough1',
      confirmPassword: 'longenough2'
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });
});
