import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Compass,
  Cpu,
  GraduationCap,
  HeartHandshake,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero, SectionHeading } from '../components/site/Section';
import { ContactDetails, ContactCta } from '../components/site/ContactCta';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Badge';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useApi } from '../hooks/useApi';
import { listStaff } from '../services/content';
import type { StaffProfile } from '../types';

const principles = [
  {
    icon: MessageSquare,
    title: 'Plain language',
    description:
      'Documents, training and advice should be understandable to the people who have to use them — not only to specialists.'
  },
  {
    icon: Compass,
    title: 'Honest scope',
    description:
      'We agree the work, assumptions and costs before starting. If something is outside our capability, we will say so.'
  },
  {
    icon: HeartHandshake,
    title: 'Client ownership',
    description:
      'Files, accounts and systems should remain under your control, with handover information you can keep.'
  },
  {
    icon: ShieldCheck,
    title: 'Care with information',
    description:
      'We collect only what is needed, restrict access and treat client information as confidential.'
  }
];

const capabilities = [
  {
    icon: Briefcase,
    title: 'Business advisory and documentation',
    items: [
      'Business profiles and capability statements',
      'Registration and TIN application assistance',
      'Project proposals and budgets',
      'Straightforward bookkeeping and record systems'
    ]
  },
  {
    icon: Cpu,
    title: 'ICT services and support',
    items: [
      'Computer networking and Starlink installation',
      'Computer diagnosis and repair support',
      'Websites and database-backed systems',
      'ICT equipment sourcing and technical projects'
    ]
  },
  {
    icon: GraduationCap,
    title: 'Practical training',
    items: [
      'Basic computing and Microsoft Office',
      'Software and internet skills',
      'Administration and office practice',
      'Needs-based training for teams and groups'
    ]
  }
];

export function AboutPage() {
  const { company } = useSiteSettings();
  const staff = useApi<StaffProfile[]>((signal) => listStaff(signal), []);

  return (
    <>
      <Seo
        title="About KILSTA"
        description="KILSTA Business & ICT Consultants is a Papua New Guinea-registered consultancy based in Alotau, providing business advisory, ICT services and practical training."
        path="/about"
      />

      <PageHero
        eyebrow="About KILSTA"
        title="A local consultancy with a practical focus"
        description="KILSTA Business & ICT Consultants supports individuals, businesses, institutions and community organisations with the business and technology foundations they need to operate with confidence."
        actions={
          <>
            <Link to="/contact" className="btn-primary">
              Talk to us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/services/business" className="btn-light">
              Explore services
            </Link>
          </>
        }
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="Based in Milne Bay, working across Papua New Guinea"
            />
            <div className="prose-kilsta mt-6">
              <p>
                KILSTA is registered in Papua New Guinea and based at Gumini Village, Huhu LLG, in
                the Alotau District of Milne Bay Province. Our work brings together business
                advisory, information and communications technology, and practical training.
              </p>
              <p>
                Many organisations do not need a large consultancy. They need someone who can help
                organise information, explain a process, set up a working system or build confidence
                with everyday digital tools. That is the kind of support KILSTA is set up to provide.
              </p>
              <p>
                We work with clients in person where location allows and remotely where that is the
                sensible option. The scope, assumptions and any costs are agreed before work begins.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge tone="teal">
                <BadgeCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Registered {company.registrationNumber}
              </Badge>
              <Badge>TIN {company.tin}</Badge>
              <Badge tone="info">
                <MapPin className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Alotau, Milne Bay Province
              </Badge>
            </div>
          </div>

          <div className="card-surface p-6">
            <h2 className="text-base font-semibold text-navy-900">Registered details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Legal / trading name
                </dt>
                <dd className="mt-1 font-medium text-navy-900">{company.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Registration number
                </dt>
                <dd className="mt-1 font-medium text-navy-900">{company.registrationNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">TIN</dt>
                <dd className="mt-1 font-medium text-navy-900">{company.tin}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Postal address
                </dt>
                <dd className="mt-1 text-slate-700">{company.postalAddress}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </dt>
                <dd className="mt-1 text-slate-700">{company.location}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <ContactDetails compact />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="What guides our work"
            title="Principles we can be held to"
            description="These principles shape how we scope, deliver and hand over work. They are commitments about approach, not claims about scale or accreditation."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <div key={principle.title} className="card-surface p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <principle.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-900">{principle.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Capabilities"
            title="What we can help with"
            description="The list below reflects the service areas described on this website. Specific scope, availability and pricing are confirmed for each engagement."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <div key={capability.title} className="rounded-2xl border border-slate-200 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-teal-300">
                  <capability.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-900">{capability.title}</h3>
                <ul className="mt-3 space-y-2">
                  {capability.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our team"
            title="People behind the work"
            description="Published team profiles appear below. If no profiles are shown, individual staff details have not been published on this website yet."
          />
          <div className="mt-10">
            {staff.loading ? (
              <LoadingBlock rows={2} />
            ) : staff.error ? (
              <ErrorBlock message={staff.error} onRetry={staff.reload} />
            ) : staff.data && staff.data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staff.data.map((person) => (
                  <article key={person.id} className="card-surface overflow-hidden">
                    <div className="aspect-[4/3] bg-navy-50">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.full_name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-navy-300">
                          <Users className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-navy-900">{person.full_name}</h3>
                      <p className="mt-1 text-sm font-medium text-teal-700">{person.title}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{person.bio}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="Staff profiles are not published yet"
                description="We have not published individual team profiles on this website. For enquiries, please contact KILSTA directly and we will direct you to the right person."
                action={
                  <Link to="/contact" className="btn-primary">
                    Contact KILSTA
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: Building2,
              title: 'Businesses and institutions',
              text: 'Documentation, systems and advisory support aligned to how your organisation operates.'
            },
            {
              icon: Cpu,
              title: 'ICT practicalities',
              text: 'Networks, devices, websites and data tools set up with handover in mind.'
            },
            {
              icon: GraduationCap,
              title: 'Skills that transfer',
              text: 'Training designed around real tasks, with room for questions and practice.'
            }
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContactCta
        title="Let's talk about what you are trying to achieve"
        description="Share the situation in plain language. We will clarify the options and let you know whether KILSTA can help."
      />
    </>
  );
}
