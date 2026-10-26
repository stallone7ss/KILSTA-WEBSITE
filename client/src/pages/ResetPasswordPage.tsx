import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Alert, Spinner } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { useAuth } from '../hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../lib/validation';

export function ResetPasswordPage() {
  const {
    status,
    session,
    configurationError,
    updatePassword,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const password = watch('password');
  const checks = [
    { label: 'At least 10 characters', met: password.length >= 10 },
    { label: 'Contains a letter', met: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) }
  ];

  useEffect(() => {
    if (status === 'signed_out') {
      setServerError(null);
    }
  }, [status]);

  if (configurationError) {
    return (
      <>
        <Seo title="Reset password" description="Reset KILSTA administrator password." noIndex />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-semibold text-navy-900">Sign-in is not configured</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The browser Supabase URL and publishable key are missing, so password reset cannot be
            completed here.
          </p>
          <Link to="/login" className="btn-outline mt-6">
            Back to sign in
          </Link>
        </div>
      </>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-16" role="status">
        <Spinner className="h-7 w-7" />
        <p className="text-sm text-slate-500">Checking your reset link…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Seo title="Reset password" description="Reset KILSTA administrator password." noIndex />
        <div className="card-surface p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Reset link not available</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This page needs a valid, unexpired password reset link. Reset links can only be used
            once. Request a new link and open it in the same browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/forgot-password" className="btn-primary">
              Request a new link
            </Link>
            <Link to="/login" className="btn-outline">
              Back to sign in
            </Link>
          </div>
        </div>
      </>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await updatePassword(values.password);
    if (!result.ok) {
      setServerError(result.error ?? 'The password could not be updated.');
      return;
    }
    await signOut();
    navigate('/login', {
      replace: true,
      state: {
        message: 'Your password has been updated. Sign in with your new password.'
      }
    });
  });

  return (
    <>
      <Seo title="Choose a new password" description="Set a new KILSTA administrator password." noIndex />

      <Link
        to="/login"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </Link>

      <div className="mb-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-teal-300">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use a unique password that you do not use for another service. You will be signed out
          after saving so you can sign in again.
        </p>
      </div>

      {serverError ? (
        <div className="mb-6">
          <Alert tone="danger" title="Password not updated">
            <p>{serverError}</p>
          </Alert>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="relative">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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

        <ul className="grid gap-1.5 text-xs sm:grid-cols-3" aria-label="Password requirements">
          {checks.map((check) => (
            <li
              key={check.label}
              className={check.met ? 'font-medium text-teal-700' : 'text-slate-500'}
            >
              {check.met ? '✓' : '•'} {check.label}
            </li>
          ))}
        </ul>

        <Input
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </>
  );
}
