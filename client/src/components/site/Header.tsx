import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Menu, Phone, X } from 'lucide-react';
import { NAV_LINKS } from '../../lib/company';
import { cn } from '../../lib/utils';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Logo } from './Logo';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { company } = useSiteSettings();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-semibold transition-colors',
      isActive
        ? 'bg-teal-50 text-teal-800'
        : 'text-navy-700 hover:bg-navy-50 hover:text-navy-900'
    );

  return (
    <>
      <div className="hidden bg-navy-950 text-navy-100 lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p>Alotau, Milne Bay Province · Papua New Guinea</p>
          <div className="flex items-center gap-5">
            <a className="inline-flex items-center gap-1.5 hover:text-white" href={`tel:${company.phoneHref}`}>
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {company.phone}
            </a>
            <a
              className="inline-flex items-center gap-1.5 hover:text-white"
              href={`mailto:${company.email}`}
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {company.email}
            </a>
            <Link className="font-semibold text-teal-200 hover:text-white" to="/login">
              Admin sign in
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <Link to="/quote" className="btn-primary btn-sm">
              Request a quote
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-300 p-2.5 text-navy-800 xl:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[70] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div
            id="mobile-navigation"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-lift animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="scroll-thin flex-1 overflow-y-auto px-4 py-5" aria-label="Mobile navigation">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold',
                    isActive ? 'bg-teal-50 text-teal-800' : 'text-navy-800 hover:bg-navy-50'
                  )
                }
              >
                Home
              </NavLink>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold',
                      isActive ? 'bg-teal-50 text-teal-800' : 'text-navy-800 hover:bg-navy-50'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="space-y-3 border-t border-slate-200 px-5 py-5">
              <Link to="/quote" className="btn-primary w-full">
                Request a quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <a href={`tel:${company.phoneHref}`} className="font-medium hover:text-navy-900">
                  {company.phone}
                </a>
                <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
                  Admin sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
