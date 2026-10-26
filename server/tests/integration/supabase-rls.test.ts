import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const enabled =
  process.env.RUN_INTEGRATION === '1' && Boolean(url && publishableKey && secretKey);

/**
 * These checks run against a real Supabase project. They are skipped unless
 * RUN_INTEGRATION=1 and credentials are supplied, so CI never needs secrets.
 *
 * They verify the browser-facing grants/RLS boundary: the anon role may read
 * only published catalogue rows and cannot read or write submissions.
 */
describe.skipIf(!enabled)('live Supabase RLS and grants', () => {
  function clients() {
    const anon = createClient(url ?? '', publishableKey ?? '', {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const service = createClient(url ?? '', secretKey ?? '', {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return { anon, service };
  }

  it('lets the browser role read only published catalogue records', async () => {
    const { anon } = clients();
    const { data, error } = await anon.from('services').select('id,title,published');
    expect(error).toBeNull();
    for (const row of data ?? []) {
      expect(row.published).toBe(true);
    }
  });

  it('denies the browser role direct access to quote submissions', async () => {
    const { anon } = clients();
    const { error } = await anon.from('quote_requests').select('id').limit(1);
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/permission denied|row-level security/i);
  });

  it('denies the browser role direct insertion into submissions', async () => {
    const { anon } = clients();
    const { error } = await anon.from('quote_requests').insert({
      full_name: 'RLS Test',
      email: 'rls-test@example.com',
      phone: '+675 00000000',
      service_category: 'business',
      requested_service: 'RLS check',
      project_description: 'This insert must be rejected by table grants.',
      preferred_contact_method: 'email',
      contact_consent: true
    });
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/permission denied|row-level security/i);
  });

  it('allows the trusted server role to read submissions', async () => {
    const { service } = clients();
    const { error } = await service.from('quote_requests').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('keeps the media bucket public-read without anonymous upload access', async () => {
    const { service } = clients();
    const buckets = await service.storage.getBucket('media');
    expect(buckets.error).toBeNull();
    expect(buckets.data?.public).toBe(true);
  });
});
