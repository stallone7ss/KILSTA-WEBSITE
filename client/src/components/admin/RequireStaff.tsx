import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../site/Logo';
import { Spinner } from '../ui/Feedback';
import { Button } from '../ui/Button';

function AdminScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-5 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

export function RequireStaff({ children }: { children: ReactNode }) {
  const {
    status,
    session,
    me,
    accessDenied,
    profileLoading,
    profileError,
    configurationError,
    signOut,
    refresh
  } = useAuth();
  const location = useLocation();

  if (status === 'loading' || (session && profileLoading)) {
    return (
      <AdminScreen>
        <div className="flex flex-col items-center gap-4 text-center" role="status">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-slate-500">Verifying your administrative access…</p>
        </div>
      </AdminScreen>
    );
  }

  if (configurationError) {
    return (
      <AdminScreen>
        <div className="card-surface p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Administration is not configured</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The browser Supabase URL and publishable key are not set for this deployment, so
            administrators cannot sign in.
          </p>
          <Link to="/" className="btn-outline mt-6">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to the website
          </Link>
        </div>
      </AdminScreen>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (accessDenied) {
    return (
      <AdminScreen>
        <div className="card-surface p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Access not authorised</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This account does not have an administrator or staff role. An administrator must assign
            access before the dashboard can be used.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
            <Link to="/" className="btn-primary">
              Return to website
            </Link>
          </div>
        </div>
      </AdminScreen>
    );
  }

  if (profileError || !me) {
    return (
      <AdminScreen>
        <div className="card-surface p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Access could not be verified</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profileError ??
              'Your account details were not returned by the API. Check the deployment and try again.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void refresh()}>
              Try again
            </Button>
            <Button variant="ghost" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </AdminScreen>
    );
  }

  return <>{children}</>;
}

export function RequirePermission({
  permission,
  children
}: {
  permission: string;
  children: ReactNode;
}) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return (
      <div className="card-surface p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-navy-900">You do not have access to this section</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your role does not include this permission. If you need access, ask an administrator to
          review your role. The restriction is also enforced by the API.
        </p>
        <Link to="/admin" className="btn-outline mt-6">
          Back to dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
