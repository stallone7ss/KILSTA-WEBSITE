import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home, Mail } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { ContactDetails } from '../components/site/ContactCta';

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you requested could not be found on the KILSTA website."
        noIndex
      />
      <section className="bg-mist py-20 sm:py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-teal-300">
              <Compass className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Error 404
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              We could not find that page
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The address may be mistyped, or the page may have moved. You can return to the home
              page, explore our services, or contact us directly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn-primary">
                <Home className="h-4 w-4" aria-hidden="true" />
                Home
              </Link>
              <Link to="/contact" className="btn-outline">
                Contact us
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { to: '/services/business', label: 'Business services' },
              { to: '/services/ict', label: 'ICT services' },
              { to: '/training', label: 'Training and courses' }
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="card-surface flex items-center justify-between p-5 text-sm font-semibold text-navy-900 transition hover:border-teal-300"
              >
                {link.label}
                <ArrowRight className="h-4 w-4 text-teal-600" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-md">
            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                <Mail className="h-4 w-4 text-teal-600" aria-hidden="true" />
                Still need help?
              </h2>
              <div className="mt-4">
                <ContactDetails compact />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
