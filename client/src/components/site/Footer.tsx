import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { NAV_LINKS } from '../../lib/company';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Logo } from './Logo';

const serviceLinks = [
  { to: '/services/business', label: 'Business services' },
  { to: '/services/ict', label: 'ICT services' },
  { to: '/training', label: 'Training' },
  { to: '/training/register', label: 'Course registration' },
  { to: '/projects', label: 'Projects' },
  { to: '/products', label: 'Products' }
];

const companyLinks = [
  { to: '/about', label: 'About KILSTA' },
  { to: '/quote', label: 'Request a quote' },
  { to: '/contact', label: 'Contact us' },
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/terms', label: 'Terms of use' },
  { to: '/login', label: 'Admin sign in' }
];

export function Footer() {
  const { company } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-navy-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-6 text-navy-300">{company.tagline}</p>
          <div className="mt-6 space-y-3 text-sm">
            <a
              href={`tel:${company.phoneHref}`}
              className="flex items-start gap-2.5 hover:text-white"
            >
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-start gap-2.5 hover:text-white">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
              <span className="break-all">{company.email}</span>
            </a>
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
              <span>{company.location}</span>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Services</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {serviceLinks.map((link) => (
              <li key={link.to}>
                <Link className="transition hover:text-white" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Company</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {companyLinks.map((link) => (
              <li key={link.to}>
                <Link className="transition hover:text-white" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
            Registered details
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-navy-400">Postal address</dt>
              <dd className="mt-0.5">{company.postalAddress}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy-400">Registration number</dt>
              <dd className="mt-0.5 font-medium text-navy-100">{company.registrationNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy-400">TIN</dt>
              <dd className="mt-0.5 font-medium text-navy-100">{company.tin}</dd>
            </div>
          </dl>
          <Link
            to="/quote"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
          >
            Start a conversation
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. All rights reserved.
          </p>
          <p>Alotau · Milne Bay Province · Papua New Guinea</p>
        </div>
      </div>

      <nav className="sr-only" aria-label="Footer navigation">
        {NAV_LINKS.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
