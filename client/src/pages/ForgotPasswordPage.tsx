import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Alert } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { useAuth } from '../hooks/useAuth';
import { forgotPasswordSchema } from '../lib/validation';
import type { z } from 'zod';

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { requestPasswordReset, configurationError } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      setServerError(result.error ?? 'The request could not be completed.');
      return;
    }
    setSentTo(values.email);
  });

  return (
    <>
      <Seo
        title="Reset your password"
        description="Request a password reset link for KILSTA administrator access."
        noIndex
      />

      <Link
        to="/login"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </Link>

      {sentTo ? (
        <div className="card-surface p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <MailCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-navy-900">Check your email</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            If an administrator account exists for <strong className="text-navy-900">{sentTo}</strong>,
            a password reset link has been requested. The link is time-limited and can only be used
            once.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Email delivery depends on this deployment&apos;s email configuration. If nothing arrives,
            check your spam folder and ask the site administrator to verify the account and mail
            settings.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary">
              Return to sign in
            </Link>
            <button type="button" className="btn-outline" onClick={() => setSentTo(null)}>
              Use a different email
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-teal-300">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-navy-900">Reset your password</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the email address associated with your administrator or staff account. We will
              ask Supabase Auth to send a reset link.
            </p>
          </div>

          {configurationError ? (
            <Alert tone="warning" title="Sign-in is not configured">
              <p>
                The browser Supabase URL and publishable key are missing from this deployment. A
                password reset cannot be sent until they are configured.
              </p>
            </Alert>
          ) : null}

          {serverError ? (
            <div className="mb-6">
              <Alert tone="danger" title="Reset request not sent">
                <p>{serverError}</p>
              </Alert>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={configurationError}
            >
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            For security, this page does not confirm whether an account exists. Contact the site
            administrator if your account needs to be created or restored.
          </p>
        </>
      )}
    </>
  );
}
