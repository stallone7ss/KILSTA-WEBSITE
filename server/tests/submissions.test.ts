import { describe, expect, it } from 'vitest';
import { createSubmissionService } from '../src/services/submission.service';
import type { EmailMessage } from '../src/services/email.service';
import { AppError } from '../src/utils/errors';
import {
  FakeDb,
  TEST_QUOTE,
  silentLogger,
  testConfig
} from './helpers';
import {
  contactMessageSchema,
  courseRegistrationSchema,
  quoteRequestSchema
} from '../src/validators/public';

function serviceFor(db: FakeDb, sent: EmailMessage[] = []) {
  return createSubmissionService({
    getDb: () => db.asClient(),
    config: testConfig({ ADMIN_NOTIFICATION_EMAIL: 'office@kilsta.example' }),
    logger: silentLogger,
    email: {
      provider: 'none',
      async send(message) {
        sent.push(message);
        return { status: 'skipped', provider: 'none', reason: 'Email delivery is disabled.' };
      }
    },
    now: () => new Date('2026-10-25T08:30:00.000Z')
  });
}

describe('quote submission workflow', () => {
  it('stores a quote with a server-generated reference and skipped email status', async () => {
    const db = new FakeDb();
    const sent: EmailMessage[] = [];
    const service = serviceFor(db, sent);

    const receipt = await service.createQuoteRequest(quoteRequestSchema.parse(TEST_QUOTE));

    expect(receipt.reference).toMatch(/^KQ-2610-[A-HJ-NP-Z2-9]{6}$/);
    expect(receipt.submittedAt).toBe('2026-10-25T08:30:00.000Z');
    expect(receipt.notifications).toEqual({ customer: 'skipped', business: 'skipped' });

    const rows = db.rows('quote_requests');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      reference: receipt.reference,
      full_name: 'Maria Kila',
      email: 'maria@example.com',
      service_category: 'business',
      contact_consent: true,
      customer_notification_status: 'skipped',
      business_notification_status: 'skipped',
      status: 'New'
    });
    expect(rows[0].project_description).toContain('business plan');
    expect(rows[0].notification_attempted_at).toBe('2026-10-25T08:30:00.000Z');
  });

  it('does not claim delivery when no email provider is configured', async () => {
    const db = new FakeDb();
    const sent: EmailMessage[] = [];
    const service = serviceFor(db, sent);

    const receipt = await service.createQuoteRequest(quoteRequestSchema.parse(TEST_QUOTE));

    expect(receipt.notifications.customer).toBe('skipped');
    expect(receipt.notifications.business).toBe('skipped');
    expect(sent).toHaveLength(2);
    expect(sent[0].to).toBe('maria@example.com');
    expect(sent[1].to).toBe('office@kilsta.example');
    expect(sent[0].html).toContain('Maria Kila');
    expect(sent[0].html).toContain(receipt.reference ?? '');
  });

  it('generates a different reference for each quote', async () => {
    const db = new FakeDb();
    const service = serviceFor(db);

    const first = await service.createQuoteRequest(quoteRequestSchema.parse(TEST_QUOTE));
    const second = await service.createQuoteRequest(
      quoteRequestSchema.parse({ ...TEST_QUOTE, email: 'second@example.com' })
    );

    expect(first.reference).not.toBe(second.reference);
    expect(db.rows('quote_requests')).toHaveLength(2);
  });
});

describe('contact submission workflow', () => {
  it('stores an enquiry and records notification attempts separately', async () => {
    const db = new FakeDb();
    const service = serviceFor(db);

    const receipt = await service.createContactMessage(
      contactMessageSchema.parse({
        fullName: 'Peter Wala',
        email: 'peter@example.com',
        phone: '+675 70000000',
        organization: 'Wala Stores',
        subject: 'Stock system enquiry',
        message: 'We would like to discuss a simple stock control system for our store.',
        contactConsent: true
      })
    );

    expect(receipt.reference).toBeNull();
    expect(receipt.notifications).toEqual({ customer: 'skipped', business: 'skipped' });
    expect(db.rows('contact_messages')[0]).toMatchObject({
      full_name: 'Peter Wala',
      email: 'peter@example.com',
      status: 'New',
      contact_consent: true,
      customer_notification_status: 'skipped'
    });
  });
});

describe('course registration workflow', () => {
  const courseId = '11111111-1111-4111-8111-111111111111';

  it('rejects registration for an unpublished or unknown course', async () => {
    const db = new FakeDb({
      courses: [{ id: courseId, title: 'Hidden course', published: false }]
    });
    const service = serviceFor(db);

    await expect(
      service.createCourseRegistration(
        courseRegistrationSchema.parse({
          courseId,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+675 70000000',
          contactConsent: true
        })
      )
    ).rejects.toMatchObject<AppError>({
      statusCode: 422,
      message: 'That course is not currently open for registration.'
    });
    expect(db.rows('course_registrations')).toHaveLength(0);
  });

  it('stores a registration for a published course with a reference', async () => {
    const db = new FakeDb({
      courses: [{ id: courseId, title: 'Small Business Bookkeeping', published: true }]
    });
    const service = serviceFor(db);

    const receipt = await service.createCourseRegistration(
      courseRegistrationSchema.parse({
        courseId,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+675 70000000',
        organization: 'Doe Catering',
        preferredStartDate: '2027-02-01',
        message: 'Please advise the next intake.',
        contactConsent: true
      })
    );

    expect(receipt.reference).toMatch(/^KR-2610-/);
    expect(db.rows('course_registrations')[0]).toMatchObject({
      reference: receipt.reference,
      course_id: courseId,
      full_name: 'Jane Doe',
      status: 'Pending',
      contact_consent: true
    });
  });
});
