import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Logo({
  light = false,
  compact = false,
  className
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-3', className)}
      aria-label="KILSTA Business & ICT Consultants — home"
    >
      <span
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5',
          light ? 'bg-white/10 ring-1 ring-white/20' : 'bg-navy-900'
        )}
      >
        <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
          <path d="M10 8h5.5v10.5L25 8h6.5L20 20l12 12h-6.8L15.5 21.5V32H10V8z" fill="#ffffff" />
          <circle cx="32" cy="8.5" r="2.6" fill="#2ec4b6" />
        </svg>
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-lg font-bold tracking-tight',
              light ? 'text-white' : 'text-navy-900'
            )}
          >
            KILSTA
          </span>
          <span
            className={cn(
              'mt-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
              light ? 'text-teal-200' : 'text-teal-600'
            )}
          >
            Business &amp; ICT Consultants
          </span>
        </span>
      ) : null}
    </Link>
  );
}
