import { describe, expect, it } from 'vitest';
import {
  contactMessageSchema,
  courseRegistrationSchema,
  quoteRequestSchema
} from '../src/validators/public';
import { listQuerySchema, quoteStatusUpdateSchema } from '../src/validators/admin';
import { TEST_QUOTE } from './helpers';

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function issuesFor(result: { success: boolean; error?: { issues: Array<{ path: Array<string | number>; message: string }> } }) {
  return result.success ? [] : (result.error?.issues ?? []);
}

describe('quote request validation', () => {
  it('accepts a complete quote and normalises the email address', () => {
    const parsed = quoteRequestSchema.parse(TEST_QUOTE);
    expect(parsed.email).toBe('maria@example.com');
    expect(parsed.fullName).toBe('Maria Kila');
    expect(parsed.contactConsent).toBe(true);
    expect(parsed.website).toBeUndefined();
  });

  it('normalises blank optional fields to undefined', () => {
    const parsed = quoteRequestSchema.parse({
      ...TEST_QUOTE,
      organization: '   ',
      budgetRange: '',
      preferredCompletionDate: ''
    });
    expect(parsed.organization).toBeUndefined();
    expect(parsed.budgetRange).toBeUndefined();
    expect(parsed.preferredCompletionDate).toBeUndefined();
  });

  it('requires explicit consent', () => {
    const result = quoteRequestSchema.safeParse({ ...TEST_QUOTE, contactConsent: false });
    expect(result.success).toBe(false);
    expect(issuesFor(result).map((issue) => issue.path.join('.'))).toContain('contactConsent');
  });

  it('rejects a short project description', () => {
    const result = quoteRequestSchema.safeParse({
      ...TEST_QUOTE,
      projectDescription: 'Too short'
    });
    expect(result.success).toBe(false);
    expect(issuesFor(result)[0]?.message).toMatch(/at least 20 characters/);
  });

  it('rejects invalid email and phone values', () => {
    const result = quoteRequestSchema.safeParse({
      ...TEST_QUOTE,
      email: 'not-an-email',
      phone: 'call me'
    });
    expect(result.success).toBe(false);
    const paths = issuesFor(result).map((issue) => issue.path.join('.'));
    expect(paths).toContain('email');
    expect(paths).toContain('phone');
  });

  it('rejects past and far-future completion dates', () => {
    const past = quoteRequestSchema.safeParse({
      ...TEST_QUOTE,
      preferredCompletionDate: '2020-01-01'
    });
    expect(past.success).toBe(false);
    expect(issuesFor(past)[0]?.message).toMatch(/future/);

    const farFuture = new Date();
    farFuture.setUTCFullYear(farFuture.getUTCFullYear() + 3);
    const result = quoteRequestSchema.safeParse({
      ...TEST_QUOTE,
      preferredCompletionDate: farFuture.toISOString().slice(0, 10)
    });
    expect(result.success).toBe(false);
    expect(issuesFor(result)[0]?.message).toMatch(/two years/);
  });

  it('rejects an impossible calendar date', () => {
    const result = quoteRequestSchema.safeParse({
      ...TEST_QUOTE,
      preferredCompletionDate: '2027-02-30'
    });
    expect(result.success).toBe(false);
  });

  it('rejects a filled honeypot without revealing why', () => {
    const result = quoteRequestSchema.safeParse({ ...TEST_QUOTE, website: 'https://spam.example' });
    expect(result.success).toBe(false);
    expect(issuesFor(result).map((issue) => issue.path.join('.'))).toContain('website');
  });

  it('accepts a valid future completion date', () => {
    const result = quoteRequestSchema.safeParse({
      ...TEST_QUOTE,
      preferredCompletionDate: futureDate(30)
    });
    expect(result.success).toBe(true);
  });
});

describe('contact and registration validation', () => {
  it('accepts a contact message with an optional phone', () => {
    const parsed = contactMessageSchema.parse({
      fullName: 'John Gila',
      email: 'john@example.com',
      phone: '',
      organization: '',
      subject: 'Opening hours',
      message: 'Please confirm your opening hours and location in Alotau.',
      contactConsent: true
    });
    expect(parsed.phone).toBeUndefined();
    expect(parsed.organization).toBeUndefined();
  });

  it('requires a valid course UUID and phone for registration', () => {
    const result = courseRegistrationSchema.safeParse({
      courseId: 'not-a-uuid',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      contactConsent: true
    });
    expect(result.success).toBe(false);
    const paths = issuesFor(result).map((issue) => issue.path.join('.'));
    expect(paths).toContain('courseId');
    expect(paths).toContain('phone');
  });

  it('accepts a registration with a valid course id', () => {
    const result = courseRegistrationSchema.safeParse({
      courseId: '11111111-1111-4111-8111-111111111111',
      fullName: 'Jane Doe',
      email: 'JANE@EXAMPLE.COM',
      phone: '+675 70000000',
      contactConsent: true,
      preferredStartDate: futureDate(45)
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('jane@example.com');
  });
});

describe('admin query and status validation', () => {
  it('coerces page and page size and caps page size at 100', () => {
    const parsed = listQuerySchema.parse({ page: '3', pageSize: '50' });
    expect(parsed.page).toBe(3);
    expect(parsed.pageSize).toBe(50);
    expect(() => listQuerySchema.parse({ pageSize: '101' })).toThrow();
  });

  it('only accepts known quote statuses', () => {
    expect(quoteStatusUpdateSchema.parse({ status: 'Under Review' }).status).toBe('Under Review');
    expect(() => quoteStatusUpdateSchema.parse({ status: 'Done' })).toThrow();
  });
});
