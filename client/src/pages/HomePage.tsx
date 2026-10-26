import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Compass,
  GraduationCap,
  Handshake,
  LifeBuoy,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { SectionHeading } from '../components/site/Section';
import { HeroVisual } from '../components/site/HeroVisual';
import { CourseCard, ProjectCard, ServiceCard } from '../components/site/Cards';
import { ContactCta } from '../components/site/ContactCta';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Badge';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useApi } from '../hooks/useApi';
import { listCourses, listProjects, listServices } from '../services/content';
import type { Course, Project, Service } from '../types';

const audiences = [
  {
    icon: Users,
    title: 'Individuals',
    description:
      'Practical guidance for people starting or formalising a small venture, and digital skills training for everyday work.'
  },
  {
    icon: Building2,
    title: 'Small and growing businesses',
    description:
      'Support with business documentation, registration steps, systems, websites and the technology that keeps operations moving.'
  },
  {
    icon: Handshake,
    title: 'Institutions and organisations',
    description:
      'Clear written material, ICT assistance and staff training tailored to the way your organisation actually works.'
  },
  {
    icon: Compass,
    title: 'Communities and groups',
    description:
      'Accessible, plain-language support for groups that want to organise information, improve digital access or build capability.'
  }
];

const approach = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Listen and clarify',
    description:
      'We start with what you need, who it is for and what constraints matter. If we are not the right fit, we will say so.'
  },
  {
    icon: Compass,
    step: '02',
    title: 'Scope the work',
    description:
      'You receive clear next steps, assumptions and a written quotation where appropriate — before work begins.'
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Deliver with care',
    description:
      'We work through agreed tasks, keep you informed and hand over documents, systems or training you can actually use.'
  },
  {
    icon: LifeBuoy,
    step: '04',
    title: 'Support the handover',
    description:
      'Where agreed, we provide guidance so your team can maintain what has been built after the engagement ends.'
  }
];

export function HomePage() {
  const { homepage, company } = useSiteSettings();
  const services = useApi<Service[]>(
    (signal) => listServices({ featured: true, signal }),
    []
  );
  const courses = useApi<Course[]>((signal) => listCourses(signal), []);
  const projects = useApi<Project[]>((signal) => listProjects({ signal }), []);

  return (
    <>
      <Seo
        title="KILSTA Business & ICT Consultants"
        description="Business advisory, ICT services and practical training for individuals, businesses and organisations in Alotau and across Papua New Guinea."
        path="/"
      />

      <section className="relative overflow-hidden bg-navy-950 pb-20 pt-16 text-white sm:pt-20 lg:pb-24">
        <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-70" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="animate-fade-up">
            <p className="eyebrow !text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" aria-hidden="true" />
              {homepage.heroEyebrow}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-[3.4rem]">
              {homepage.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-navy-100 sm:text-lg">
              {homepage.heroDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/quote" className="btn-primary">
                {homepage.heroPrimaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/services/business" className="btn-light">
                {homepage.heroSecondaryCta}
              </Link>
            </div>
            <p className="mt-7 flex items-center gap-2 text-xs text-navy-300">
              <ShieldCheck className="h-4 w-4 text-teal-300" aria-hidden="true" />
              {homepage.supportingNote}
            </p>
          </div>
          <div className="animate-fade-up lg:justify-self-end">
            <HeroVisual />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: 'Locally based',
              text: 'Alotau, Milne Bay Province — with remote support available'
            },
            {
              icon: Sparkles,
              title: 'Business and ICT together',
              text: 'One team for strategy, documentation, systems and skills'
            },
            {
              icon: CheckCircle2,
              title: 'Clear next steps',
              text: 'Scope and quotation before work begins'
            }
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-900">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="bg-mist py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="What we do"
              title="Support that meets you where you are"
              description="Our work covers business advisory, practical ICT support and training. Each engagement starts with your actual situation, not a fixed package."
            />
            <Link
              to="/services/business"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Browse all services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10">
            {services.loading ? (
              <LoadingBlock rows={2} />
            ) : services.error ? (
              <ErrorBlock message={services.error} onRetry={services.reload} />
            ) : services.data && services.data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.data.slice(0, 6).map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-5 w-5" />}
                title="Service information is being prepared"
                description="Our detailed service list has not been published yet. Tell us what you need and we will confirm how we can help."
                action={
                  <Link to="/quote" className="btn-primary">
                    Request a quote
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <SectionHeading
            eyebrow="Who we work with"
            title="Different clients. The same attention to the basics."
            description="KILSTA works with people and organisations at different stages. We adapt the scope and language to suit the client, while keeping the process clear."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {audiences.map((audience) => (
              <div key={audience.title} className="rounded-2xl border border-slate-200 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                  <audience.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-900">{audience.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-white sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we work"
            title="A straightforward process"
            description="No jargon and no surprises. We agree what needs to happen, what it will cost and who is responsible before the work starts."
            light
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {approach.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-navy-400">{item.step}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-200">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Training"
              title="Build confidence with everyday digital tools"
              description="Courses focus on practical skills participants can apply at work, in study or while running a small business."
            />
            <Link
              to="/training"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Explore training
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10">
            {courses.loading ? (
              <LoadingBlock rows={2} />
            ) : courses.error ? (
              <ErrorBlock message={courses.error} onRetry={courses.reload} />
            ) : courses.data && courses.data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.data.slice(0, 3).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<GraduationCap className="h-5 w-5" />}
                title="Course schedule coming together"
                description="Published courses will appear here. You can still register your interest and we will discuss upcoming options."
                action={
                  <Link to="/training/register" className="btn-primary">
                    Register interest
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      {projects.data && projects.data.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Published work"
                title="Selected projects"
                description="Project summaries published after client review. We only display work that has been approved for publication."
              />
              <Link
                to="/projects"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                View all projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.data.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-8 rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <Badge tone="teal">Alotau · Milne Bay Province</Badge>
            <h2 className="mt-4 text-2xl font-bold text-navy-900">
              Not sure what you need yet?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Describe the situation in plain language. We will ask clarifying questions and suggest
              sensible next steps. There is no obligation to proceed.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to="/quote" className="btn-primary">
              Request a quote
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="btn-outline">
              Contact {company.shortName}
            </Link>
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
