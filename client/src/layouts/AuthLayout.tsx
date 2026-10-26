import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/site/Logo';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-navy-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-70" aria-hidden="true" />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative max-w-md">
          <p className="eyebrow !text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" aria-hidden="true" />
            Secure administration
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white">
            Manage enquiries, content and training registrations.
          </h1>
          <p className="mt-4 text-sm leading-6 text-navy-200">
            This area is restricted to authorised KILSTA administrators and staff. Activity is
            recorded for accountability.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-navy-200">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" aria-hidden="true" />
            Access is verified on the server. Roles are read from the database on every request.
          </div>
        </div>
        <p className="relative text-xs text-navy-400">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Return to the KILSTA website
          </Link>
        </p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 px-5 py-4 lg:hidden">
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-slate-100 px-5 py-5 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-navy-700">
            KILSTA Business &amp; ICT Consultants
          </Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-navy-700">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-navy-700">
            Terms
          </Link>
        </footer>
      </div>
    </div>
  );
}
