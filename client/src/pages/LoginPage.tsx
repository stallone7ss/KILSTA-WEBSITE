import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldAlert } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Alert, Spinner } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../lib/validation';

interface LoginLocationState {
  from?: string;
  message?: string;
}

export function LoginPage() {
  const { status, session, me, accessDenied, profileLoading, profileError, configurationError, signIn, signOut } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LoginLocationState;
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (state.message) {
      window.history.replaceState({}, document.title);
    }
  }, [state.message]);

  if (configurationError) {
    return (
      <>
        <Seo title="Administrator sign in" description="Secure access for KILSTA administrators." noIndex />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Sign-in is not configured</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This deployment does not have the browser Supabase URL and publishable key configured.
            An administrator must set <code className="rounded bg-white px-1 py-0.5">VITE_SUPABASE_URL</code>{' '}
            and{' '}
            <code className="rounded bg-white px-1 py-0.5">VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
            before staff can sign in.
          </p>
          <Link to="/" className="btn-outline mt-6">
            Return to the website
          </Link>
        </div>
      </>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-16" role="status">
        <Spinner className="h-7 w-7" />
        <p className="text-sm text-slate-500">Checking your session…</p>
      </div>
    );
  }

  if (session && me) {
    return <Navigate to={state.from?.startsWith('/admin') ? state.from : '/admin'} replace />;
  }

  if (session && accessDenied) {
    return (
      <>
        <Seo title="Access not available" description="KILSTA administrator access." noIndex />
        <div className="card-surface p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Account not authorised</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You are signed in, but this account does not have an administrator or staff role. Ask an
            existing administrator to assign access. Public pages remain available without signing
            in.
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
      </>
    );
  }

  if (session && profileError) {
    return (
      <>
        <Seo title="Access could not be verified" description="KILSTA administrator access." noIndex />
        <div className="card-surface p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Access could not be verified</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{profileError}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check that the API is running and that your connection is working, then try again.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-outline" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </>
    );
  }

  if (session && (profileLoading || !me)) {
    return (
      <div className="flex flex-col items-center gap-4 py-16" role="status">
        <Spinner className="h-7 w-7" />
        <p className="text-sm text-slate-500">Verifying administrator access…</p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await signIn(values.email, values.password);
    if (!result.ok) {
      setServerError(result.error ?? 'Sign-in could not be completed.');
      passwordRef.current?.focus();
      return;
    }
    navigate(state.from?.startsWith('/admin') ? state.from : '/admin', { replace: true });
  });

  return (
    <>
      <Seo
        title="Administrator sign in"
        description="Secure sign-in for KILSTA administrators and staff."
        noIndex
      />

      <div className="mb-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-teal-300">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Administrator sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use the account provided by the KILSTA administrator. There is no public registration
          for administrative access.
        </p>
      </div>

      {state.message ? (
        <div className="mb-6">
          <Alert tone="success" title="Done">
            <p>{state.message}</p>
          </Alert>
        </div>
      ) : null}

      {serverError ? (
        <div className="mb-6">
          <Alert tone="danger" title="Sign-in failed">
            <p>{serverError}</p>
          </Alert>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="username"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              error={errors.password?.message}
              className="pr-12"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-[38px] rounded p-1 text-slate-400 hover:text-navy-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-semibold text-teal-700 hover:text-teal-800">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign in
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-6 text-xs leading-5 text-slate-500">
        Access is checked against the database on every request. If you believe you should have
        access but this page is not working, contact the site administrator.
      </p>
    </>
  );
}
