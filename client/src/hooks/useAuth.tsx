import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { ApiError, apiGet } from '../lib/api';
import { isSupabaseConfigured, PASSWORD_RESET_REDIRECT, supabase } from '../lib/supabase';
import type { AdminMe } from '../types';

type AuthStatus = 'loading' | 'signed_out' | 'signed_in';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  me: AdminMe | null;
  accessDenied: boolean;
  profileLoading: boolean;
  profileError: string | null;
  configurationError: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'The email or password is incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'This account has not been confirmed. Contact the site administrator.';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (lower.includes('password should be at least')) {
    return 'Use a stronger password (at least 10 characters).';
  }
  return 'Sign-in could not be completed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<AdminMe | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadMe = useCallback(async (activeSession: Session | null) => {
    if (!activeSession) {
      setMe(null);
      setAccessDenied(false);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await apiGet<AdminMe>('/admin/me', {
        token: activeSession.access_token
      });
      setMe(response.data);
      setAccessDenied(false);
    } catch (error) {
      setMe(null);
      if (error instanceof ApiError && (error.status === 403 || error.status === 401)) {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
        setProfileError(
          error instanceof ApiError
            ? error.message
            : 'Your access could not be verified. Please try again.'
        );
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setStatus('signed_out');
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setStatus(data.session ? 'signed_in' : 'signed_out');
        if (data.session) void loadMe(data.session);
      })
      .catch(() => {
        if (active) setStatus('signed_out');
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setStatus(nextSession ? 'signed_in' : 'signed_out');
      // Defer async Supabase-backed work out of the callback.
      window.setTimeout(() => {
        if (active) void loadMe(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { ok: false, error: 'Authentication is not configured for this deployment.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    setSession(data.session);
    setStatus(data.session ? 'signed_in' : 'signed_out');
    if (data.session) await loadMe(data.session);
    return { ok: true };
  }, [loadMe]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setMe(null);
    setAccessDenied(false);
    setProfileLoading(false);
    setProfileError(null);
    setStatus('signed_out');
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!supabase) {
      return { ok: false, error: 'Authentication is not configured for this deployment.' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: PASSWORD_RESET_REDIRECT
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) {
      return { ok: false, error: 'Authentication is not configured for this deployment.' };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const refresh = useCallback(async () => {
    const activeSession = session ?? (supabase ? (await supabase.auth.getSession()).data.session : null);
    setSession(activeSession);
    await loadMe(activeSession);
  }, [loadMe, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      me,
      accessDenied,
      profileLoading,
      profileError,
      configurationError: !isSupabaseConfigured,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      refresh,
      hasPermission: (permission: string) =>
        Boolean(me?.permissions.includes(permission) || me?.roles.includes('admin'))
    }),
    [
      status,
      session,
      me,
      accessDenied,
      profileLoading,
      profileError,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      refresh
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
