import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  MailCheck,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { ContactDetails } from '../components/site/ContactCta';
import { SubmissionResult } from '../components/site/SubmissionResult';
import { Alert } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '../components/ui/Form';
import { Badge } from '../components/ui/Badge';
import { SERVICE_CATEGORIES } from '../lib/company';
import { applyServerErrors } from '../lib/formErrors';
import { ApiError } from '../lib/api';
import { quoteFormSchema, type QuoteFormValues } from '../lib/validation';
import { submitQuote } from '../services/submissions';
import type { SubmissionReceipt } from '../types';

function dateBounds() {
  const now = new Date();
  const min = now.toISOString().slice(0, 10);
  const maxDate = new Date(now);
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  return { min, max: maxDate.toISOString().slice(0, 10) };
}

function initialCategory(value: string | null): 'business' | 'ict' | 'training' | '' {
  if (value === 'business' || value === 'ict' || value === 'training') return value;
  return '';
}

export function QuotePage() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service') ?? '';
  const categoryParam = initialCategory(searchParams.get('category'));
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otherIssues, setOtherIssues] = useState<string[]>([]);
  const bounds = useMemo(dateBounds, []);
  const resultRef = useRef<HTMLDivElement>(null);

  const defaultValues: QuoteFormValues = {
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    serviceCategory: categoryParam || 'business',
    requestedService: serviceParam,
    projectDescription: '',
    preferredContactMethod: 'email',
    budgetRange: '',
    preferredCompletionDate: '',
    contactConsent: false,
    website: ''
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (categoryParam) setValue('serviceCategory', categoryParam);
    if (serviceParam) setValue('requestedService', serviceParam);
  }, [categoryParam, serviceParam, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setOtherIssues([]);
    try {
      const result = await submitQuote(values);
      setReceipt(result);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Your quote request could not be submitted. Please try again.'
      );
      setOtherIssues(
        applyServerErrors(error, setError, [
          'fullName',
          'organization',
          'email',
          'phone',
          'serviceCategory',
          'requestedService',
          'projectDescription',
          'preferredContactMethod',
          'budgetRange',
          'preferredCompletionDate',
          'contactConsent'
        ])
      );
    }
  });

  const resetForm = () => {
    setReceipt(null);
    setServerError(null);
    setOtherIssues([]);
    reset({ ...defaultValues, serviceCategory: categoryParam || 'business', requestedService: serviceParam });
  };

  return (
    <>
      <Seo
        title="Request a Quote"
        description="Request a written quotation for business advisory, ICT services or training from KILSTA Business & ICT Consultants in Alotau, Papua New Guinea."
        path="/quote"
      />

      <PageHero
        eyebrow="Request a quote"
        title="Tell us what you need"
        description="Share the situation in plain language. We will review it, ask any clarifying questions and respond using your preferred contact method. A request is not a quotation until we confirm scope and pricing in writing."
        actions={
          <Link to="/contact" className="btn-light">
            Prefer to send a message?
          </Link>
        }
      />

      <section className="bg-mist py-14 sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start">
          <div ref={resultRef}>
            {receipt ? (
              <SubmissionResult
                receipt={receipt}
                onReset={resetForm}
                resetLabel="Submit another quote request"
              />
            ) : (
              <form onSubmit={onSubmit} className="card-surface p-6 sm:p-8" noValidate>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-navy-900">Quote request details</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Fields marked with <span className="text-red-600">*</span> are required.
                    </p>
                  </div>
                  <Badge tone="teal">No obligation</Badge>
                </div>

                {serverError ? (
                  <div className="mt-6">
                    <Alert tone="danger" title="Quote request not submitted">
                      <p>{serverError}</p>
                      {otherIssues.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {otherIssues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      ) : null}
                    </Alert>
                  </div>
                ) : null}

                <div className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Full name"
                      required
                      autoComplete="name"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                    <Input
                      label="Organisation (optional)"
                      autoComplete="organization"
                      error={errors.organization?.message}
                      {...register('organization')}
                    />
                    <Input
                      label="Email address"
                      type="email"
                      required
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Phone number"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+675 00000000"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select
                      label="Service category"
                      required
                      error={errors.serviceCategory?.message}
                      {...register('serviceCategory')}
                    >
                      <option value="">Choose a category</option>
                      {SERVICE_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Requested service"
                      required
                      placeholder="For example: website design"
                      error={errors.requestedService?.message}
                      {...register('requestedService')}
                    />
                  </div>

                  <Textarea
                    label="Describe what you need"
                    required
                    rows={6}
                    hint="Include the current situation, what you want to achieve, and anything that affects timing. At least 20 characters."
                    error={errors.projectDescription?.message}
                    {...register('projectDescription')}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select
                      label="Preferred contact method"
                      required
                      error={errors.preferredContactMethod?.message}
                      {...register('preferredContactMethod')}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </Select>
                    <Input
                      label="Budget range (optional)"
                      placeholder="For example: PGK 2,000–5,000"
                      hint="An indication helps us suggest suitable options. It is not binding."
                      error={errors.budgetRange?.message}
                      {...register('budgetRange')}
                    />
                  </div>

                  <Input
                    label="Preferred completion date (optional)"
                    type="date"
                    min={bounds.min}
                    max={bounds.max}
                    hint="Choose a date within the next two years. We will confirm whether it is realistic."
                    error={errors.preferredCompletionDate?.message}
                    {...register('preferredCompletionDate')}
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Checkbox
                      label={
                        <span>
                          I agree that KILSTA may contact me about this request and store the details
                          I have provided. I have read the{' '}
                          <Link to="/privacy" className="font-semibold text-teal-700 underline">
                            privacy policy
                          </Link>
                          .
                        </span>
                      }
                      error={errors.contactConsent?.message}
                      {...register('contactConsent')}
                    />
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="quote-website">Leave this field empty</label>
                    <input id="quote-website" tabIndex={-1} autoComplete="off" {...register('website')} />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-xs leading-5 text-slate-500">
                      We use your details only to respond to this request. Do not include passwords or
                      sensitive financial account information.
                    </p>
                    <Button type="submit" loading={isSubmitting}>
                      Submit quote request
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card-surface p-6">
              <h2 className="text-base font-semibold text-navy-900">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    icon: ClipboardList,
                    text: 'Your request is recorded and you receive a unique reference.'
                  },
                  {
                    icon: MessageSquare,
                    text: 'We review the details and contact you if anything needs clarification.'
                  },
                  {
                    icon: FileText,
                    text: 'Where appropriate, we provide a written quotation with scope and assumptions.'
                  },
                  {
                    icon: CheckCircle2,
                    text: 'Work only begins after you accept the scope and any terms.'
                  }
                ].map((item, index) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Step {index + 1}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900">
                <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
                Helpful details to include
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>What you are trying to achieve</li>
                <li>Who the work is for</li>
                <li>Any deadline or event date</li>
                <li>Rough budget, if you have one</li>
              </ul>
            </div>

            <div className="card-surface p-6">
              <h2 className="text-base font-semibold text-navy-900">Prefer to talk?</h2>
              <div className="mt-4">
                <ContactDetails compact />
              </div>
            </div>

            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-teal-300">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-white">No automatic pricing</h2>
              <p className="mt-1.5 text-sm leading-6 text-navy-200">
                This form does not generate a price. We quote after understanding the scope, because
                a responsible estimate needs context.
              </p>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-navy-300">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
                Automatic email confirmations depend on this deployment&apos;s email configuration.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
