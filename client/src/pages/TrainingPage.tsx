import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Laptop,
  Monitor,
  Users
} from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero, SectionHeading } from '../components/site/Section';
import { CourseCard } from '../components/site/Cards';
import { ContactCta } from '../components/site/ContactCta';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Badge';
import { COURSE_CATEGORY_LABELS } from '../lib/company';
import { cn } from '../lib/utils';
import { useApi } from '../hooks/useApi';
import { listCourses } from '../services/content';
import type { Course } from '../types';

const steps = [
  {
    icon: BookOpenCheck,
    title: 'Choose a course',
    text: 'Review the published course outlines and select the one closest to your needs.'
  },
  {
    icon: CalendarDays,
    title: 'Register your interest',
    text: 'Tell us your preferred start date and any context about your team or experience level.'
  },
  {
    icon: Users,
    title: 'We confirm arrangements',
    text: 'KILSTA contacts you to discuss schedule, fees, venue or online delivery and availability. A place is not confirmed until then.'
  }
];

const faqs = [
  {
    question: 'Do I need my own computer?',
    answer:
      'Some courses are best with a device you can practise on. If you are unsure what to bring, ask us before the course and we will confirm what is available.'
  },
  {
    question: 'Are course dates guaranteed?',
    answer:
      'No. Registering records your interest; it does not reserve a place. We confirm dates, fees and availability directly with you before anything is finalised.'
  },
  {
    question: 'Do you issue certificates?',
    answer:
      'Certificate arrangements depend on the course and are confirmed before registration. We do not claim external accreditation unless it has been explicitly agreed.'
  },
  {
    question: 'Can training be delivered for an organisation?',
    answer:
      'Yes, training can be discussed for teams and organisations. Content is adapted after a short needs conversation. Contact us to describe your group and goals.'
  }
];

export function TrainingPage() {
  const courses = useApi<Course[]>((signal) => listCourses(signal), []);
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const values = new Set((courses.data ?? []).map((course) => course.category));
    return Array.from(values);
  }, [courses.data]);

  const filtered = useMemo(() => {
    if (!courses.data) return [];
    if (category === 'all') return courses.data;
    return courses.data.filter((course) => course.category === category);
  }, [category, courses.data]);

  return (
    <>
      <Seo
        title="ICT Training"
        description="Practical computer, Microsoft Office, software and internet training from KILSTA in Alotau, Milne Bay Province. Register your interest online."
        path="/training"
      />

      <PageHero
        eyebrow="Training"
        title="Practical digital skills for work and business"
        description="KILSTA training focuses on tasks people actually need to perform — using a computer confidently, working with documents and spreadsheets, and getting things done online."
        actions={
          <>
            <Link to="/training/register" className="btn-primary">
              Register your interest
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="btn-light">
              Ask about training
            </Link>
          </>
        }
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Courses"
              title="Choose a course to build on"
              description="Published courses are listed below. Registration records your interest; KILSTA confirms schedule, fees and availability before a place is reserved."
            />
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Laptop className="h-4 w-4 text-teal-600" aria-hidden="true" />
                Filter
              </span>
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  category === 'all'
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                All courses
              </button>
              {categories.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    category === value
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {COURSE_CATEGORY_LABELS[value] ?? value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {courses.loading ? (
              <LoadingBlock rows={3} />
            ) : courses.error ? (
              <ErrorBlock message={courses.error} onRetry={courses.reload} />
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<GraduationCap className="h-5 w-5" />}
                title="No published courses in this view"
                description="Course information is updated as arrangements are confirmed. You can still register your interest and we will discuss upcoming options."
                action={
                  <Link to="/training/register" className="btn-primary">
                    Register interest
                  </Link>
                }
              />
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Badge tone="neutral">
              <Monitor className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Delivery mode confirmed per course
            </Badge>
            <Badge tone="neutral">
              <CalendarDays className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Dates arranged with participants
            </Badge>
            <span>Prices, where shown, are confirmed before payment.</span>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="From interest to confirmed training"
            description="A short, transparent process so you know what happens after you register."
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="card-surface relative p-6">
                <span className="absolute right-5 top-5 font-mono text-xs font-semibold text-slate-300">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading
            eyebrow="Questions"
            title="Before you register"
            description="If something is unclear, ask before submitting. We would rather answer a question than have you arrive unprepared."
          />
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {faqs.map((faq) => (
              <details key={faq.question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-navy-900">
                  <span className="flex items-start gap-2.5">
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                    {faq.question}
                  </span>
                  <span className="text-slate-400 transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-2 pl-7 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-14">
        <div className="container-page flex flex-col items-start justify-between gap-5 rounded-2xl border border-teal-200 bg-teal-50/70 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-navy-900">Ready to register your interest?</p>
              <p className="mt-1 text-sm text-slate-600">
                The form takes a few minutes. You will receive a reference for follow-up.
              </p>
            </div>
          </div>
          <Link to="/training/register" className="btn-primary shrink-0">
            Go to registration
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <ContactCta
        title="Training shaped around your team"
        description="Tell us about the group, the work they do and the skills gap. We will suggest a practical format."
        primaryLabel="Discuss training"
        primaryTo="/contact"
        secondaryLabel="Request a quote"
        secondaryTo="/quote?category=training&service=ICT%20training"
      />
    </>
  );
}
