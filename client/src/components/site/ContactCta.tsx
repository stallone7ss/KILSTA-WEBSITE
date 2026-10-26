import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { COMPANY } from '../../lib/company';

export function ContactDetails({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-5'}>
      <a
        href={`tel:${COMPANY.phoneHref}`}
        className="group flex items-start gap-3 text-sm text-slate-600 transition hover:text-navy-900"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Phone className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Phone
          </span>
          <span className="font-medium group-hover:underline">{COMPANY.phone}</span>
        </span>
      </a>
      <a
        href={`mailto:${COMPANY.email}`}
        className="group flex items-start gap-3 text-sm text-slate-600 transition hover:text-navy-900"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Mail className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Email
          </span>
          <span className="break-all font-medium group-hover:underline">{COMPANY.email}</span>
        </span>
      </a>
      <div className="flex items-start gap-3 text-sm text-slate-600">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Location
          </span>
          <span className="font-medium">{COMPANY.location}</span>
        </span>
      </div>
      <div className="flex items-start gap-3 text-sm text-slate-600">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Postal address
          </span>
          <span className="font-medium">{COMPANY.postalAddress}</span>
        </span>
      </div>
    </div>
  );
}

export function ContactCta({
  title = 'Ready to discuss your next step?',
  description = 'Tell us what you need and we will respond with clear next steps, scope questions and a written quotation where appropriate.',
  primaryLabel = 'Request a quote',
  primaryTo = '/quote',
  secondaryLabel = 'Contact us',
  secondaryTo = '/contact'
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}) {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 shadow-lift sm:px-10 sm:py-14">
        <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow !text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" aria-hidden="true" />
              Start a conversation
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
            <p className="mt-3 text-[15px] leading-7 text-navy-100">{description}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href={primaryTo} className="btn-primary">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={secondaryTo} className="btn-light">
              {secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
