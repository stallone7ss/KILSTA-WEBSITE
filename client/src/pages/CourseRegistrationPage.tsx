import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, Mail, Phone } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { ContactDetails } from '../components/site/ContactCta';
import { SubmissionResult } from '../components/site/SubmissionResult';
import { Alert, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '../components/ui/Form';
import { Badge } from '../components/ui/Badge';
import { formatPrice } from '../lib/format';
import { applyServerErrors } from '../lib/formErrors';
import { ApiError } from '../lib/api';
import {
  registrationFormSchema,
  type RegistrationFormValues
} from '../lib/validation';
import { useApi } from '../hooks/useApi';
import { listCourses } from '../services/content';
import { submitRegistration } from '../services/submissions';
import type { Course, SubmissionReceipt } from '../types';

function dateBounds() {
  const now = new Date();
  const min = now.toISOString().slice(0, 10);
  const maxDate = new Date(now);
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  return { min, max: maxDate.toISOString().slice(0, 10) };
}

export function CourseRegistrationPage() {
  const courses = useApi<Course[]>((signal) => listCourses(signal), []);
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('course') ?? '';
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otherIssues, setOtherIssues] = useState<string[]>([]);
  const bounds = useMemo(dateBounds, []);
  const resultRef = useRef<HTMLDivElement>(null);

  const defaultValues: RegistrationFormValues = {
    courseId: preselected,
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    preferredStartDate: '',
    message: '',
    contactConsent: false,
    website: ''
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues
  });

  const selectedId = watch('courseId');
  const selectedCourse = courses.data?.find((course) => course.id === selectedId) ?? null;

  useEffect(() => {
    if (!courses.data || !preselected) return;
    const direct = courses.data.find((course) => course.id === preselected);
    const bySlug = direct ?? courses.data.find((course) => course.slug === preselected);
    if (bySlug) setValue('courseId', bySlug.id);
  }, [courses.data, preselected, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setOtherIssues([]);
    try {
      const result = await submitRegistration(values);
      setReceipt(result);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Your registration could not be submitted. Please try again.'
      );
      setOtherIssues(
        applyServerErrors(error, setError, [
          'courseId',
          'fullName',
          'email',
          'phone',
          'organization',
          'preferredStartDate',
          'message',
          'contactConsent'
        ])
      );
    }
  });

  const resetForm = () => {
    setReceipt(null);
    setServerError(null);
    setOtherIssues([]);
    reset({ ...defaultValues, courseId: selectedId || preselected });
  };

  return (
    <>
      <Seo
        title="Course Registration"
        description="Register your interest in KILSTA ICT training in Alotau, Milne Bay Province. A place is confirmed after KILSTA contacts you."
        path="/training/register"
      />

      <PageHero
        eyebrow="Course registration"
        title="Register your interest in training"
        description="Complete the form to record your interest. KILSTA will contact you about schedule, fees and availability. Submitting this form does not confirm a place."
        actions={
          <Link to="/training" className="btn-light">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to training
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
                resetLabel="Register for another course"
              />
            ) : (
              <form onSubmit={onSubmit} className="card-surface p-6 sm:p-8" noValidate>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-navy-900">Registration details</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Fields marked with <span className="text-red-600">*</span> are required.
                    </p>
                  </div>
                  <Badge tone="teal">No payment online</Badge>
                </div>

                {serverError ? (
                  <div className="mt-6">
                    <Alert tone="danger" title="Registration not submitted">
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
                  {courses.loading ? (
                    <LoadingBlock rows={1} label="Loading courses" />
                  ) : courses.error ? (
                    <ErrorBlock message={courses.error} onRetry={courses.reload} />
                  ) : (
                    <Select
                      label="Course"
                      required
                      error={errors.courseId?.message}
                      {...register('courseId')}
                    >
                      <option value="">Choose a course</option>
                      {(courses.data ?? []).map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </Select>
                  )}

                  {selectedCourse ? (
                    <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                      <p className="text-sm font-semibold text-navy-900">{selectedCourse.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{selectedCourse.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <Badge>{selectedCourse.level ?? 'Level on enquiry'}</Badge>
                        <Badge>{selectedCourse.duration ?? 'Duration on enquiry'}</Badge>
                        <Badge tone="teal">
                          {formatPrice(selectedCourse.price, selectedCourse.currency)}
                        </Badge>
                      </div>
                    </div>
                  ) : null}

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
                      label="Phone number"
                      type="tel"
                      required
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
                    label="Preferred start date (optional)"
                    type="date"
                    min={bounds.min}
                    max={bounds.max}
                    hint="Choose a date within the next two years. Final dates are confirmed with you."
                    error={errors.preferredStartDate?.message}
                    {...register('preferredStartDate')}
                  />

                  <Textarea
                    label="Anything we should know? (optional)"
                    rows={4}
                    hint="For example: your experience level, the number of people in your group, or access needs."
                    error={errors.message?.message}
                    {...register('message')}
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Checkbox
                      label={
                        <span>
                          I agree that KILSTA may contact me about this registration and store the
                          details I have provided. I have read the{' '}
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
                    <label htmlFor="registration-website">Leave this field empty</label>
                    <input
                      id="registration-website"
                      tabIndex={-1}
                      autoComplete="off"
                      {...register('website')}
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-500">
                      A place is not confirmed until KILSTA contacts you and agrees the arrangements.
                    </p>
                    <Button type="submit" loading={isSubmitting}>
                      Submit registration
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
                    icon: CheckCircle2,
                    text: 'Your registration is recorded and you receive a reference number.'
                  },
                  {
                    icon: Phone,
                    text: 'KILSTA contacts you to discuss schedule, fees and availability.'
                  },
                  {
                    icon: CalendarDays,
                    text: 'A place is only confirmed once those arrangements are agreed.'
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
              <h2 className="text-base font-semibold text-navy-900">Need help?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact us if you are unsure which course fits or need to discuss a group booking.
              </p>
              <div className="mt-4">
                <ContactDetails compact />
              </div>
            </div>

            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-teal-300">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-white">No online payment</h2>
              <p className="mt-1.5 text-sm leading-6 text-navy-200">
                This form does not take payment. Fees are discussed and confirmed directly before any
                payment is requested.
              </p>
            </div>

            <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
              We will only use your details to respond to this registration.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
