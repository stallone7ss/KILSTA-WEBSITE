import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import type { AdminService } from '../src/services/admin.service';
import type { ContentService } from '../src/services/content.service';
import type { SubmissionService } from '../src/services/submission.service';
import type { AuthGateway, AuthenticatedUser } from '../src/services/auth.service';
import type { Role } from '../src/config/permissions';
import { silentLogger, testConfig, TEST_QUOTE } from './helpers';

const users: Record<string, { user: AuthenticatedUser; roles: Role[] }> = {
  'staff-token': {
    user: { id: 'staff-1', email: 'staff@kilsta.example' },
    roles: ['staff']
  },
  'admin-token': {
    user: { id: 'admin-1', email: 'admin@kilsta.example' },
    roles: ['admin']
  }
};

const authGateway: AuthGateway = {
  async verifyAccessToken(token) {
    return users[token]?.user ?? null;
  },
  async getRoles(userId) {
    return Object.values(users).find((entry) => entry.user.id === userId)?.roles ?? [];
  },
  async getProfile(userId) {
    return userId === 'staff-1'
      ? { id: userId, email: 'staff@kilsta.example', full_name: 'Staff Member', phone: null }
      : null;
  }
};

const content: ContentService = {
  async listServices() {
    return [];
  },
  async getServiceBySlug() {
    throw new Error('not used');
  },
  async listCourses() {
    return [];
  },
  async getCourseBySlug() {
    throw new Error('not used');
  },
  async listProjects() {
    return [];
  },
  async getProjectBySlug() {
    throw new Error('not used');
  },
  async listProducts() {
    return [];
  },
  async getProductBySlug() {
    throw new Error('not used');
  },
  async listStaff() {
    return [];
  },
  async getPublicSettings() {
    return {
      company_profile: { name: 'KILSTA Business & ICT Consultants' },
      homepage: { heroTitle: 'Clear thinking. Practical systems.' }
    };
  }
};

const createQuoteRequest = vi.fn<SubmissionService['createQuoteRequest']>(async () => ({
  reference: 'KQ-2610-TEST23',
  submittedAt: '2026-10-25T08:30:00.000Z',
  notifications: { customer: 'skipped', business: 'skipped' }
}));

const submissions: SubmissionService = {
  createQuoteRequest,
  async createContactMessage() {
    return {
      reference: null,
      submittedAt: '2026-10-25T08:30:00.000Z',
      notifications: { customer: 'skipped', business: 'skipped' }
    };
  },
  async createCourseRegistration() {
    return {
      reference: 'KR-2610-TEST23',
      submittedAt: '2026-10-25T08:30:00.000Z',
      notifications: { customer: 'skipped', business: 'skipped' }
    };
  }
};

const quoteRow = {
  id: '11111111-1111-4111-8111-111111111111',
  reference: 'KQ-2610-ABC234',
  full_name: 'Maria Kila',
  email: 'maria@example.com',
  status: 'New'
};

const listUsers = vi.fn(async () => ({ items: [], total: 0 }));
const listSettings = vi.fn(async () => []);

const admin = {
  listQuotes: vi.fn(async () => ({ items: [quoteRow], total: 21 })),
  updateQuote: vi.fn(async () => quoteRow),
  listSettings,
  listUsers,
  listCatalog: vi.fn(async () => ({ items: [], total: 0 }))
} as unknown as AdminService;

function testApp() {
  return createApp({
    config: testConfig(),
    logger: silentLogger,
    auth: authGateway,
    content,
    submissions,
    admin,
    enableRateLimits: false
  });
}

describe('public API', () => {
  it('returns public settings without exposing internal fields', async () => {
    const response = await request(testApp()).get('/api/v1/site').expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.company_profile.name).toBe('KILSTA Business & ICT Consultants');
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('creates a quote request and returns the server reference', async () => {
    const response = await request(testApp())
      .post('/api/v1/quotes')
      .send(TEST_QUOTE)
      .expect(201);

    expect(response.body.data.reference).toBe('KQ-2610-TEST23');
    expect(response.body.data.notifications).toEqual({
      customer: 'skipped',
      business: 'skipped'
    });
    expect(response.body.data.message).toMatch(/not a quotation yet/i);
    expect(createQuoteRequest).toHaveBeenCalledTimes(1);
    const input = createQuoteRequest.mock.calls[0][0];
    expect(input.email).toBe('maria@example.com');
    expect(input.contactConsent).toBe(true);
  });

  it('rejects invalid quote input before reaching the submission service', async () => {
    createQuoteRequest.mockClear();
    const response = await request(testApp())
      .post('/api/v1/quotes')
      .send({ ...TEST_QUOTE, contactConsent: false, email: 'bad' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    const paths = response.body.error.details.map((item: { path: string }) => item.path);
    expect(paths).toContain('contactConsent');
    expect(paths).toContain('email');
    expect(createQuoteRequest).not.toHaveBeenCalled();
  });

  it('rejects a completed honeypot field', async () => {
    const response = await request(testApp())
      .post('/api/v1/contact')
      .send({
        fullName: 'Bot',
        email: 'bot@example.com',
        subject: 'Spam offer',
        message: 'This should never be delivered to the business inbox.',
        contactConsent: true,
        website: 'https://spam.example'
      })
      .expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects malformed JSON with a consistent error body', async () => {
    const response = await request(testApp())
      .post('/api/v1/quotes')
      .set('Content-Type', 'application/json')
      .send('{"fullName":')
      .expect(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'INVALID_JSON' }
    });
  });

  it('limits request bodies to 100kb', async () => {
    const response = await request(testApp())
      .post('/api/v1/quotes')
      .send({ ...TEST_QUOTE, organization: 'x'.repeat(120_000) })
      .expect(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('returns a JSON 404 for unknown API endpoints', async () => {
    const response = await request(testApp()).get('/api/v1/nope').expect(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.requestId).toBeTruthy();
  });

  it('sets security headers and hides the framework header', async () => {
    const response = await request(testApp()).get('/api/v1/services').expect(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.body).toEqual({ success: true, data: [] });
  });

  it('allows configured origins and refuses unlisted browser origins', async () => {
    const allowed = await request(testApp())
      .get('/api/v1/services')
      .set('Origin', 'http://localhost:5173')
      .expect(200);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');

    const denied = await request(testApp())
      .get('/api/v1/services')
      .set('Origin', 'https://evil.example')
      .expect(200);
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('health endpoints', () => {
  it('reports degraded but live when Supabase is not configured', async () => {
    const response = await request(testApp()).get('/health').expect(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.checks.database).toBe('not_configured');
    expect(JSON.stringify(response.body)).not.toMatch(/secret|key/i);
  });

  it('is not ready when the database is not configured', async () => {
    const response = await request(testApp()).get('/health/ready').expect(503);
    expect(response.body).toEqual({
      status: 'not_ready',
      checks: { database: 'not_configured' }
    });
  });
});

describe('admin authorisation', () => {
  it('rejects requests without a bearer token', async () => {
    const response = await request(testApp()).get('/api/v1/admin/me').expect(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects an invalid or expired token', async () => {
    const response = await request(testApp())
      .get('/api/v1/admin/me')
      .set('Authorization', 'Bearer expired-token')
      .expect(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('loads roles from the database and returns the effective permissions', async () => {
    const response = await request(testApp())
      .get('/api/v1/admin/me')
      .set('Authorization', 'Bearer staff-token')
      .expect(200);
    expect(response.body.data.roles).toEqual(['staff']);
    expect(response.body.data.permissions).toContain('quotes:write');
    expect(response.body.data.permissions).not.toContain('settings:write');
    expect(response.body.data.profile.full_name).toBe('Staff Member');
  });

  it('allows staff to read quotes with pagination metadata', async () => {
    const response = await request(testApp())
      .get('/api/v1/admin/quotes?page=2&pageSize=10')
      .set('Authorization', 'Bearer staff-token')
      .expect(200);
    expect(response.body.data[0].reference).toBe('KQ-2610-ABC234');
    expect(response.body.meta).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });
  });

  it('blocks staff from settings, users and content writes', async () => {
    await request(testApp())
      .get('/api/v1/admin/settings')
      .set('Authorization', 'Bearer staff-token')
      .expect(403);
    await request(testApp())
      .get('/api/v1/admin/users')
      .set('Authorization', 'Bearer staff-token')
      .expect(403);
    await request(testApp())
      .post('/api/v1/admin/services')
      .set('Authorization', 'Bearer staff-token')
      .send({ title: 'Blocked' })
      .expect(403);
  });

  it('allows an admin to read settings and users', async () => {
    await request(testApp())
      .get('/api/v1/admin/settings')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);
    const response = await request(testApp())
      .get('/api/v1/admin/users')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);
    expect(response.body.data).toEqual([]);
    expect(listSettings).toHaveBeenCalled();
    expect(listUsers).toHaveBeenCalled();
  });

  it('validates a status update before calling the service', async () => {
    const response = await request(testApp())
      .patch('/api/v1/admin/quotes/11111111-1111-4111-8111-111111111111/status')
      .set('Authorization', 'Bearer staff-token')
      .send({ status: 'Done' })
      .expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
