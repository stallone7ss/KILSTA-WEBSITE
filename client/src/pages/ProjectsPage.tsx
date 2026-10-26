import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderKanban, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero, SectionHeading } from '../components/site/Section';
import { ProjectCard } from '../components/site/Cards';
import { ContactCta } from '../components/site/ContactCta';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { listProjects } from '../services/content';
import { SERVICE_CATEGORIES } from '../lib/company';
import { cn } from '../lib/utils';
import type { Project, ServiceCategory } from '../types';

type Filter = 'all' | ServiceCategory;

export function ProjectsPage() {
  const [category, setCategory] = useState<Filter>('all');
  const projects = useApi<Project[]>(
    (signal) => listProjects({ category: category === 'all' ? undefined : category, signal }),
    [category]
  );

  const filters: Array<{ value: Filter; label: string }> = [
    { value: 'all', label: 'All projects' },
    ...SERVICE_CATEGORIES.map((item) => ({ value: item.value, label: item.label }))
  ];

  return (
    <>
      <Seo
        title="Projects & Portfolio"
        description="Published project summaries from KILSTA Business & ICT Consultants. We only publish work that has been reviewed and approved for publication."
        path="/projects"
      />

      <PageHero
        eyebrow="Projects"
        title="Published work, described honestly"
        description="This portfolio only includes project summaries that have been reviewed and approved for publication. Where there is nothing verified to show, we say so rather than filling the page with invented examples."
        actions={
          <Link to="/quote" className="btn-primary">
            Discuss a project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Portfolio"
              title="Project summaries"
              description="Each published entry is added after the client has agreed what may be shared. Commercial details and client names are included only where permission has been given."
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setCategory(filter.value)}
                  aria-pressed={category === filter.value}
                  className={cn(
                    'rounded-full border px-3.5 py-2 text-xs font-semibold transition',
                    category === filter.value
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-navy-300 hover:bg-navy-50'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {projects.loading ? (
              <LoadingBlock rows={3} label="Loading projects" />
            ) : projects.error ? (
              <ErrorBlock message={projects.error} onRetry={projects.reload} />
            ) : projects.data && projects.data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.data.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FolderKanban className="h-5 w-5" />}
                title="No project summaries are published yet"
                description="We do not display unverified or sample work as completed projects. When a project summary is approved for publication it will appear here."
                action={
                  <Link to="/quote" className="btn-primary">
                    Tell us about your project
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-mist py-14 sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <SectionHeading
              className="mt-5"
              eyebrow="Publication standard"
              title="Approval comes before promotion"
              description="A project is only added to this page after the work is complete enough to describe accurately and the client has agreed what can be shared."
            />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              'No invented clients, logos or testimonials',
              'Client names only with permission',
              'Sensitive commercial details kept private',
              'Sample records never shown as completed work'
            ].map((item) => (
              <li key={item} className="card-surface p-4 text-sm leading-6 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCta
        title="Have a project in mind?"
        description="Describe the situation, the outcome you need and any constraints. We will tell you whether it fits our capability and what a sensible next step looks like."
      />
    </>
  );
}
