import { Briefcase, Cpu, GraduationCap, ShieldCheck, Workflow } from 'lucide-react';

/**
 * Brand illustration built from SVG shapes and UI motifs - no stock photography.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-teal-400/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-lift backdrop-blur-sm">
        <svg viewBox="0 0 520 430" className="h-auto w-full" role="presentation">
          <defs>
            <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5bdccd" />
              <stop offset="100%" stopColor="#14a89d" />
            </linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f2dc8d" />
              <stop offset="100%" stopColor="#dfae2b" />
            </linearGradient>
          </defs>

          {/* connection lines */}
          <g stroke="#5bdccd" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 6">
            <path d="M92 116 L230 76 L356 132" fill="none" />
            <path d="M92 116 L150 236 L278 292" fill="none" />
            <path d="M356 132 L430 232 L278 292" fill="none" />
            <path d="M230 76 L278 292" fill="none" />
          </g>

          {/* network nodes */}
          <g>
            <circle cx="92" cy="116" r="7" fill="url(#accent)" />
            <circle cx="230" cy="76" r="5" fill="#f2dc8d" />
            <circle cx="356" cy="132" r="7" fill="url(#accent)" />
            <circle cx="150" cy="236" r="5" fill="#f2dc8d" />
            <circle cx="430" cy="232" r="5" fill="#f2dc8d" />
            <circle cx="278" cy="292" r="9" fill="url(#accent)" />
          </g>

          {/* dashboard panel */}
          <g transform="translate(58 142)">
            <rect width="288" height="188" rx="16" fill="url(#panel)" stroke="#ffffff" strokeOpacity="0.18" />
            <rect x="18" y="18" width="88" height="8" rx="4" fill="#ffffff" fillOpacity="0.55" />
            <rect x="18" y="36" width="150" height="6" rx="3" fill="#ffffff" fillOpacity="0.22" />
            <rect x="18" y="66" width="116" height="52" rx="10" fill="#0a1f44" fillOpacity="0.5" />
            <rect x="30" y="78" width="56" height="6" rx="3" fill="#5bdccd" />
            <rect x="30" y="92" width="84" height="4" rx="2" fill="#ffffff" fillOpacity="0.35" />
            <rect x="30" y="101" width="64" height="4" rx="2" fill="#ffffff" fillOpacity="0.2" />
            <rect x="146" y="66" width="124" height="52" rx="10" fill="#0a1f44" fillOpacity="0.5" />
            <rect x="158" y="78" width="44" height="6" rx="3" fill="#f2dc8d" />
            <rect x="158" y="92" width="96" height="4" rx="2" fill="#ffffff" fillOpacity="0.35" />
            <rect x="158" y="101" width="70" height="4" rx="2" fill="#ffffff" fillOpacity="0.2" />
            <g transform="translate(18 134)">
              <rect width="252" height="34" rx="8" fill="#0a1f44" fillOpacity="0.42" />
              <circle cx="18" cy="17" r="5" fill="#5bdccd" />
              <rect x="32" y="11" width="88" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.45" />
              <rect x="32" y="21" width="130" height="4" rx="2" fill="#ffffff" fillOpacity="0.2" />
              <rect x="214" y="10" width="24" height="14" rx="7" fill="#14a89d" />
            </g>
          </g>

          {/* floating capability cards */}
          <g transform="translate(18 258)">
            <rect width="142" height="58" rx="12" fill="#ffffff" fillOpacity="0.96" />
            <rect x="12" y="12" width="34" height="34" rx="9" fill="#effcf9" />
            <g transform="translate(21 21)" stroke="#0c877f" strokeWidth="1.6" fill="none">
              <rect x="0" y="3" width="16" height="13" rx="2" />
              <path d="M3 7h10M3 11h6" />
            </g>
            <rect x="54" y="16" width="66" height="7" rx="3.5" fill="#0a1f44" />
            <rect x="54" y="30" width="76" height="5" rx="2.5" fill="#94a3b8" />
          </g>

          <g transform="translate(352 60)">
            <rect width="146" height="62" rx="12" fill="#ffffff" fillOpacity="0.96" />
            <rect x="12" y="13" width="36" height="36" rx="9" fill="#fdf9ec" />
            <g transform="translate(21 22)" stroke="#a97318" strokeWidth="1.7" fill="none">
              <circle cx="9" cy="8" r="5" />
              <path d="M2 20c1.5-4 4-6 7-6s5.5 2 7 6" />
            </g>
            <rect x="56" y="17" width="62" height="7" rx="3.5" fill="#0a1f44" />
            <rect x="56" y="31" width="78" height="5" rx="2.5" fill="#94a3b8" />
          </g>

          <g transform="translate(332 330)">
            <rect width="166" height="54" rx="12" fill="#0a1f44" stroke="#5bdccd" strokeOpacity="0.35" />
            <circle cx="26" cy="27" r="10" fill="#14a89d" fillOpacity="0.25" />
            <path d="M22 27l3 3 5-7" stroke="#5bdccd" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="44" y="16" width="80" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.8" />
            <rect x="44" y="30" width="104" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.35" />
          </g>
        </svg>
      </div>

      <div className="pointer-events-none absolute -left-4 bottom-16 hidden rounded-xl border border-white/15 bg-navy-900/90 px-4 py-3 shadow-lift backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Briefcase className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Business advisory</p>
            <p className="text-[11px] text-navy-300">Planning · profiles · systems</p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-3 top-8 hidden rounded-xl border border-white/15 bg-navy-900/90 px-4 py-3 shadow-lift backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Cpu className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">ICT support</p>
            <p className="text-[11px] text-navy-300">Hardware · software · web</p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-4 left-10 hidden rounded-xl border border-white/15 bg-navy-900/90 px-4 py-3 shadow-lift backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Practical training</p>
            <p className="text-[11px] text-navy-300">Digital skills that stick</p>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <ShieldCheck /> <Workflow />
      </div>
    </div>
  );
}
