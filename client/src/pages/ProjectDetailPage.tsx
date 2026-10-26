import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, ImageOff, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { ContactCta } from '../components/site/ContactCta';
import { categoryLabel } from '../components/site/Cards';
import { Badge } from '../components/ui/Badge';
import { ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { getProject } from '../services/content';
import { formatDate } from '../lib/format';
import type { Project } from '../types';

export function ProjectDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const project = useApi<Project>((signal) => getProject(slug, signal), [slug]);

  if (project.loading) {
    return (
      <div className="container-page py-16">
        <LoadingBlock rows={4} label="Loading project" />
      </div>
    );
  }

  if (project.error || !project.data) {
    return (
      <div className="container-page py-16 sm:py-24">
        <Seo
          title="Project not available"
          description="This KILSTA project is not available. It may be unpublished, removed, or the link may be incorrect."
          path={`/projects/${slug}`}
          noIndex
        />
        <div className="mx-auto max-w-xl">
          <ErrorBlock
            title="This project is not available"
            message={
              project.error ??
              'The project may not be published, may have been removed, or the link may be incorrect.'
            }
            onRetry={project.reload}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/projects" className="btn-outline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All projects
            </Link>
            <Link to="/contact" className="btn-primary">
              Ask about this work
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const item = project.data;
  const paragraphs = item.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <Seo
        title={item.title}
        description={item.summary}
        path={`/projects/${item.slug}`}
        type="article"
      />

      <PageHero
        eyebrow="Project summary"
        title={item.title}
        description={item.summary}
        actions={
          <>
            <Link to="/quote" className="btn-primary">
              Discuss similar work
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/projects" className="btn-light">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All projects
            </Link>
          </>
        }
      >
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone="teal">{categoryLabel(item.category)}</Badge>
          {item.completed_at ? (
            <Badge className="!border-white/20 !bg-white/10 !text-white">
              <CalendarDays className="mr-1 h-3 w-3" aria-hidden="true" />
              {formatDate(item.completed_at)}
            </Badge>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-white py-14 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
          <div>
            {item.images.length > 0 ? (
              <div className="space-y-4">
                {item.images.map((image, index) => (
                  <figure key={image.id} className="overflow-hidden rounded-2xl border border-slate-200">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${item.title} — image ${index + 1}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="w-full object-cover"
                    />
                    {image.alt_text ? (
                      <figcaption className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                        {image.alt_text}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-400">
                <ImageOff className="h-10 w-10" aria-hidden="true" />
                <p className="mt-3 text-sm">No images have been published for this project.</p>
              </div>
            )}

            <div className="prose-kilsta mt-10">
              <h2>About this work</h2>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <p>{item.summary}</p>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="card-surface p-6">
              <h2 className="text-base font-semibold text-navy-900">Project details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="text-right font-medium text-navy-900">
                    {categoryLabel(item.category)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Completion</dt>
                  <dd className="text-right font-medium text-navy-900">
                    {formatDate(item.completed_at)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500">Publication</dt>
                  <dd className="text-right font-medium text-navy-900">Client-approved summary</dd>
                </div>
              </dl>
            </div>

            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900">
                <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
                About this portfolio
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Project summaries are published only after the details have been reviewed. We do not
                publish invented clients, fictional outcomes or sample records as completed work.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Ask a question about this work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <h2 className="text-sm font-semibold text-white">Need something similar?</h2>
              <p className="mt-2 text-sm leading-6 text-navy-200">
                Every engagement is scoped to the client. Tell us what you are trying to achieve and
                we will suggest a practical starting point.
              </p>
              <Link to="/quote" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200">
                Request a quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
