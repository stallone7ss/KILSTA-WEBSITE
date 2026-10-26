import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import { isAdministrativeRole, type Role } from '../config/permissions';
import type { Logger } from '../utils/logger';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface UserProfileSummary {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
}

export interface AuthGateway {
  verifyAccessToken(token: string): Promise<AuthenticatedUser | null>;
  getRoles(userId: string): Promise<Role[]>;
  getProfile(userId: string): Promise<UserProfileSummary | null>;
}

export function createAuthGateway(
  getAuthClient: () => SupabaseClient<Database>,
  getDb: () => SupabaseClient<Database>,
  logger: Logger
): AuthGateway {
  return {
    async verifyAccessToken(token: string): Promise<AuthenticatedUser | null> {
      try {
        // This performs a real verification against Supabase Auth. It does not
        // merely decode the JWT locally.
        const { data, error } = await getAuthClient().auth.getUser(token);
        if (error || !data.user) {
          logger.debug('Rejected invalid access token', { reason: error?.message });
          return null;
        }
        return {
          id: data.user.id,
          email: data.user.email ?? ''
        };
      } catch (error) {
        logger.warn('Access token verification failed', {
          reason: error instanceof Error ? error.message : 'unknown error'
        });
        return null;
      }
    },

    async getRoles(userId: string): Promise<Role[]> {
      const { data, error } = await getDb()
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to load user roles', { code: error.code });
        throw new Error('Could not verify user roles.');
      }

      return (data ?? [])
        .map((row) => row.role)
        .filter((role): role is Role => isAdministrativeRole(role));
    },

    async getProfile(userId: string): Promise<UserProfileSummary | null> {
      const { data, error } = await getDb()
        .from('profiles')
        .select('id,email,full_name,phone')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error('Failed to load user profile', { code: error.code });
        return null;
      }
      return data ?? null;
    }
  };
}
