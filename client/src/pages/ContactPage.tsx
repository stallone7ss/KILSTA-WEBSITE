import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { ContactDetails } from '../components/site/ContactCta';
import { SubmissionResult } from '../components/site/SubmissionResult';
import { Alert } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Checkbox, Input, Textarea } from '../components/ui/Form';
import { Badge } from '../components/ui/Badge';
import { COMPANY } from '../lib/company';
import { applyServerErrors } from '../lib/formErrors';
import { ApiError } from '../lib/api';
import { contactFormSchema, type ContactFormValues } from '../lib/validation';
import { submitContact } from '../services/submissions';
import type { SubmissionReceipt } from '../types';

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get('subject') ?? '';
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otherIssues, setOtherIssues] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const defaultValues: ContactFormValues = useMemo(
    () => ({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      subject: subjectParam,
      message: '',
      contactConsent: false,
      website: ''
    }),
    [subjectParam]
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setOtherIssues([]);
    try {
      const result = await submitContact(values);
      setReceipt(result);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Your message could not be sent. Please try again.'
      );
      setOtherIssues(
        applyServerErrors(error, setError, [
          'fullName',
          'email',
          'phone',
          'organization',
          'subject',
          'message',
          'contactConsent'
        ])
      );
    }
  });

  return (
    <>
      <Seo
        title="Contact Us"
        description="Contact KILSTA Business & ICT Consultants in Alotau, Milne Bay Province. Phone +675 82545274 or email kilsta2023@gmail.com."
        path="/contact"
      />

      <PageHero
        eyebrow="Contact"
        title="Start with a conversation"
        description="Tell us what you need, what is happening now and anything that affects timing. We will respond using the contact details you provide."
        actions={
          <Link to="/quote" className="btn-primary">
            Request a quote instead
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <section className="bg-mist py-14 sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-start">
          <div ref={resultRef}>
            {receipt ? (
              <SubmissionResult
                receipt={receipt}
                onReset={() => {
                  setReceipt(null);
                  setServerError(null);
                  setOtherIssues([]);
                  reset(defaultValues);
                }}
                resetLabel="Send another message"
              />
            ) : (
              <form onSubmit={onSubmit} className="card-surface p-6 sm:p-8" noValidate>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-navy-900">Send a message</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Fields marked with <span className="text-red-600">*</span> are required.
                    </p>
                  </div>
                  <Badge tone="teal">Usually checked on business days</Badge>
                </div>

                {serverError ? (
                  <div className="mt-6">
                    <Alert tone="danger" title="Message not sent">
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
                      label="Email address"
                      type="email"
                      required
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Phone number (optional)"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+675 00000000"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Input
                      label="Organisation (optional)"
                      autoComplete="organization"
                      error={errors.organization?.message}
                      {...register('organization')}
                    />
                  </div>

                  <Input
                    label="Subject"
                    required
                    placeholder="What is this about?"
                    error={errors.subject?.message}
                    {...register('subject')}
                  />

                  <Textarea
                    label="Message"
                    required
                    rows={7}
                    hint="Do not include passwords, payment details or sensitive financial account information."
                    error={errors.message?.message}
                    {...register('message')}
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Checkbox
                      label={
                        <span>
                          I agree that KILSTA may contact me about this message and store the details
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
                    <label htmlFor="contact-website">Leave this field empty</label>
                    <input id="contact-website" tabIndex={-1} autoComplete="off" {...register('website')} />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      Your details are used to respond to this enquiry.
                    </p>
                    <Button type="submit" loading={isSubmitting}>
                      Send message
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card-surface p-6">
              <h2 className="text-base font-semibold text-navy-900">Contact details</h2>
              <div className="mt-4">
                <ContactDetails />
              </div>
            </div>

            <div className="card-surface p-6">
              <h2 className="text-base font-semibold text-navy-900">Location</h2>
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                {COMPANY.location}
              </p>
              <a
                className="mt-3 inline-flex text-sm font-semibold text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.mapsQuery)}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open location in Google Maps
              </a>
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Visits are by arrangement. Please phone or email before travelling so we can confirm
                availability and directions.
              </p>
            </div>

            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-teal-300">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-white">Prefer a quotation?</h2>
              <p className="mt-1.5 text-sm leading-6 text-navy-200">
                Use the quote request form to share more detail. You receive a reference number and we
                can scope the work properly.
              </p>
              <Link
                to="/quote"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
              >
                Request a quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900">
                <Clock className="h-4 w-4 text-teal-600" aria-hidden="true" />
                Response expectations
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We aim to respond as soon as practicable. Response times can vary with travel and
                workload. If your matter is urgent, please phone.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href={`tel:${COMPANY.phoneHref}`}
                  className="flex items-center gap-2 font-medium text-navy-800 hover:text-teal-700"
                >
                  <Phone className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  {COMPANY.phone}
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="flex items-center gap-2 break-all font-medium text-navy-800 hover:text-teal-700"
                >
                  <Mail className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  {COMPANY.email}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
