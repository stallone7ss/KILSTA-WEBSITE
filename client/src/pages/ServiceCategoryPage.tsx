import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, MousePointerClick, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero, SectionHeading } from '../components/site/Section';
import { ServiceCard } from '../components/site/Cards';
import { ContactCta } from '../components/site/ContactCta';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { listServices } from '../services/content';
import type { Service } from '../types';

const copy = {
  business: {
    eyebrow: 'Business services',
    title: 'Business foundations that hold up under scrutiny',
    description:
      'From business profiles and registration paperwork to proposals and everyday record keeping, we help you present your organisation clearly and keep the essentials in order.',
    seoTitle: 'Business Services',
    seoDescription:
      'Business profile writing, registration and TIN application assistance, project proposals, bookkeeping support and administration training from KILSTA in Alotau.',
    includes: [
      'Business profiles and capability statements',
      'Business registration and TIN application assistance',
      'Project proposals, timelines and budgets',
      'Bookkeeping and straightforward record systems',
      'Administration and office practice training'
    ],
    principles: [
      {
        icon: ShieldCheck,
        title: 'Clear boundaries',
        text: 'Statutory approvals, licensing and independent tax advice remain with the relevant authority or qualified adviser.'
      },
      {
        icon: Clock,
        title: 'Realistic timelines',
        text: 'We agree what is needed, who provides it and when — including dependencies on third parties.'
      },
      {
        icon: CheckCircle2,
        title: 'Documents you can reuse',
        text: 'Where possible, we provide editable material so your team can update it for future opportunities.'
      }
    ]
  },
  ict: {
    eyebrow: 'ICT services',
    title: 'Technology that works in the real world',
    description:
      'We help offices, schools and institutions plan, install and maintain practical ICT — from networks and connectivity to websites, databases and device repairs.',
    seoTitle: 'ICT Services',
    seoDescription:
      'Computer networking, Starlink installation, computer repairs, website design, database development and ICT equipment sourcing from KILSTA in Alotau.',
    includes: [
      'Computer networking and wireless set-up',
      'Starlink installation and basic configuration',
      'Computer diagnosis and repair support',
      'Website design and database-backed systems',
      'ICT equipment sourcing and technical projects'
    ],
    principles: [
      {
        icon: ShieldCheck,
        title: 'Security by default',
        text: 'Accounts, access and data handling are considered as part of the design, not added at the end.'
      },
      {
        icon: Clock,
        title: 'Maintainable solutions',
        text: 'We favour understandable systems your team can operate, with handover notes and basic guidance.'
      },
      {
        icon: CheckCircle2,
        title: 'Third-party costs stated',
        text: 'Equipment, hosting, domains and subscriptions are quoted separately and remain under your ownership.'
      }
    ]
  }
} as const;

export function ServiceCategoryPage({ category }: { category: 'business' | 'ict' }) {
  const content = copy[category];
  const services = useApi<Service[]>(
    (signal) => listServices({ category, signal }),
    [category]
  );

  return (
    <>
      <Seo
        title={content.seoTitle}
        description={content.seoDescription}
        path={`/services/${category}`}
      />

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        actions={
          <>
            <Link to={`/quote?category=${category}`} className="btn-primary">
              Request a quote
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="btn-light">
              Ask a question
            </Link>
          </>
        }
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Available support"
              title="Services in this category"
              description="Each service is scoped for your situation. Availability and pricing are confirmed in a written quotation where appropriate."
            />
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <MousePointerClick className="h-4 w-4 text-teal-600" aria-hidden="true" />
              Select a service to start a request
            </p>
          </div>

          <div className="mt-10">
            {services.loading ? (
              <LoadingBlock rows={3} />
            ) : services.error ? (
              <ErrorBlock message={services.error} onRetry={services.reload} />
            ) : services.data && services.data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.data.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MousePointerClick className="h-5 w-5" />}
                title="This service list is being updated"
                description="Published services in this category will appear here. In the meantime, tell us what you need and we will confirm whether we can assist."
                action={
                  <Link to={`/quote?category=${category}`} className="btn-primary">
                    Request a quote
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeading
              eyebrow="What is covered"
              title="Typical areas of support"
              description="The exact deliverable depends on your needs. Use this as a starting point for a conversation, not a fixed package."
            />
            <ul className="mt-6 space-y-3">
              {content.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.principles.map((principle) => (
              <div key={principle.title} className="card-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                  <principle.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-navy-900">{principle.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{principle.text}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-navy-900 p-5 text-white sm:col-span-2">
              <h3 className="text-sm font-semibold text-white">Not listed?</h3>
              <p className="mt-2 text-sm leading-6 text-navy-200">
                Describe your situation and we will tell you whether it fits our capability. If it
                does not, we will say so rather than stretch the scope.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
              >
                Contact us
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactCta
        title={category === 'business' ? 'Let’s get the foundations right' : 'Let’s make your technology dependable'}
        description="Tell us what is happening now and what you need to change. We will suggest a sensible next step."
      />
    </>
  );
}
