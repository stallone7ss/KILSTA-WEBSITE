import { cn } from '../../lib/utils';
import type { BadgeTone } from '../../lib/format';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-800',
  teal: 'border-teal-200 bg-teal-50 text-teal-800'
};

export function Badge({
  children,
  tone = 'neutral',
  className
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
