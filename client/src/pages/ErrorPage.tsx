import { Link } from 'react-router-dom';
import { AlertTriangle, Home, LifeBuoy, RotateCcw } from 'lucide-react';
import { Seo } from '../components/ui/Seo';

export function ErrorPage({
  title = 'Something went wrong',
  description = 'The page could not be displayed. This can happen after an update or a temporary connection problem.',
  onReset
}: {
  title?: string;
  description?: string;
  onReset?: () => void;
}) {
  return (
    <>
      <Seo title={title} description={description} noIndex />
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
              Unexpected error
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">{title}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No payment or submission is completed by this screen. If you were submitting a form,
              check with us before trying again so we can avoid duplicate records.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {onReset ? (
                <button type="button" className="btn-primary" onClick={onReset}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Try this page again
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reload the page
                </button>
              )}
              <Link to="/" className="btn-outline">
                <Home className="h-4 w-4" aria-hidden="true" />
                Return home
              </Link>
            </div>
            <p className="mt-10 inline-flex items-center gap-2 text-sm text-slate-500">
              <LifeBuoy className="h-4 w-4 text-teal-600" aria-hidden="true" />
              Need assistance? Use the contact details on our{' '}
              <Link to="/contact" className="font-semibold text-teal-700 underline">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
