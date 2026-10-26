import { describe, expect, it } from 'vitest';
import { createAdminService } from '../src/services/admin.service';
import { FakeDb, silentLogger } from './helpers';

const actor = { id: 'staff-1', email: 'staff@kilsta.example', ipHash: 'hashed-ip' };
const quoteId = '11111111-1111-4111-8111-111111111111';

function quoteRow(status: string) {
  return {
    id: quoteId,
    reference: 'KQ-2610-ABC234',
    full_name: 'Maria Kila',
    email: 'maria@example.com',
    status,
    internal_notes: null,
    created_at: '2026-10-24T00:00:00.000Z',
    updated_at: '2026-10-24T00:00:00.000Z'
  };
}

describe('admin quote status workflow', () => {
  it('moves a quote through a permitted transition and records an audit entry', async () => {
    const db = new FakeDb({ quote_requests: [quoteRow('New')] });
    const admin = createAdminService(() => db.asClient(), silentLogger);

    const updated = await admin.updateQuote(quoteId, { status: 'Under Review' }, actor);

    expect(updated.status).toBe('Under Review');
    expect(db.rows('quote_requests')[0].status).toBe('Under Review');
    const audit = db.rows('activity_logs');
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({
      actor_id: actor.id,
      actor_email: actor.email,
      action: 'quote.update',
      entity_type: 'quote_requests',
      entity_id: quoteId,
      ip_hash: actor.ipHash
    });
    expect(audit[0].metadata).toMatchObject({
      fromStatus: 'New',
      toStatus: 'Under Review',
      fields: ['status']
    });
  });

  it('rejects an illegal stage jump without writing data or audit records', async () => {
    const db = new FakeDb({ quote_requests: [quoteRow('New')] });
    const admin = createAdminService(() => db.asClient(), silentLogger);

    await expect(
      admin.updateQuote(quoteId, { status: 'Completed' }, actor)
    ).rejects.toMatchObject({
      statusCode: 422,
      message: 'A quote cannot move from "New" to "Completed".'
    });

    expect(db.rows('quote_requests')[0].status).toBe('New');
    expect(db.rows('activity_logs')).toHaveLength(0);
  });

  it('saves internal notes without changing the status', async () => {
    const db = new FakeDb({ quote_requests: [quoteRow('New')] });
    const admin = createAdminService(() => db.asClient(), silentLogger);

    const updated = await admin.updateQuote(
      quoteId,
      { internal_notes: 'Call the client after 2pm.' },
      actor
    );

    expect(updated.status).toBe('New');
    expect(updated.internal_notes).toBe('Call the client after 2pm.');
    expect(db.rows('activity_logs')[0].metadata).toMatchObject({
      fromStatus: 'New',
      toStatus: 'New',
      fields: ['internal_notes']
    });
  });

  it('returns the existing quote when there is nothing to change', async () => {
    const db = new FakeDb({ quote_requests: [quoteRow('New')] });
    const admin = createAdminService(() => db.asClient(), silentLogger);

    const existing = await admin.updateQuote(quoteId, {}, actor);

    expect(existing.status).toBe('New');
    expect(db.rows('activity_logs')).toHaveLength(0);
  });

  it('returns 404 when the quote does not exist', async () => {
    const db = new FakeDb();
    const admin = createAdminService(() => db.asClient(), silentLogger);

    await expect(admin.updateQuote(quoteId, { status: 'Under Review' }, actor)).rejects.toMatchObject(
      { statusCode: 404 }
    );
  });
});

describe('admin registration workflow', () => {
  const registrationId = '22222222-2222-4222-8222-222222222222';

  it('confirms a pending registration and records an audit entry', async () => {
    const db = new FakeDb({
      course_registrations: [
        {
          id: registrationId,
          reference: 'KR-2610-ABC234',
          course_id: quoteId,
          full_name: 'Jane Doe',
          status: 'Pending',
          internal_notes: null
        }
      ]
    });
    const admin = createAdminService(() => db.asClient(), silentLogger);

    const updated = await admin.updateRegistration(
      registrationId,
      { status: 'Confirmed' },
      actor
    );

    expect(updated.status).toBe('Confirmed');
    expect(db.rows('activity_logs')[0].action).toBe('registration.update');
  });

  it('rejects completing an unconfirmed registration', async () => {
    const db = new FakeDb({
      course_registrations: [
        { id: registrationId, status: 'Pending', internal_notes: null }
      ]
    });
    const admin = createAdminService(() => db.asClient(), silentLogger);

    await expect(
      admin.updateRegistration(registrationId, { status: 'Completed' }, actor)
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(db.rows('activity_logs')).toHaveLength(0);
  });
});
