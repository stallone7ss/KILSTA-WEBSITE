import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';
import { serviceUnavailable } from '../utils/errors';
import type { Database } from '../types/database.types';

let adminClient: SupabaseClient<Database> | null = null;
let authClient: SupabaseClient<Database> | null = null;

/**
 * Privileged server client. Uses the Supabase secret key, bypasses RLS and must
 * never be exposed to browser code. Lazily created so /health can report a
 * missing configuration without crashing the process.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!isSupabaseConfigured() || !env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw serviceUnavailable('The database is not configured on the server.');
  }
  if (!adminClient) {
    adminClient = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { 'X-Client-Info': 'kilsta-api-admin' } }
    });
  }
  return adminClient;
}

/**
 * Client used only to verify the caller's Supabase access token. Uses the
 * publishable key (falling back to the secret key on a server-only deployment).
 */
export function getSupabaseAuthClient(): SupabaseClient<Database> {
  if (!env.SUPABASE_URL || !(env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SECRET_KEY)) {
    throw serviceUnavailable('Authentication is not configured on the server.');
  }
  if (!authClient) {
    authClient = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_PUBLISHABLE_KEY ?? (env.SUPABASE_SECRET_KEY as string),
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { 'X-Client-Info': 'kilsta-api-auth' } }
      }
    );
  }
  return authClient;
}

/** Test-only helper to clear memoised clients. */
export function resetSupabaseClients(): void {
  adminClient = null;
  authClient = null;
}
