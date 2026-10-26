import type { ReactNode } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-teal-600', className)} aria-hidden="true" />;
}

export function LoadingBlock({
  label = 'Loading…',
  rows = 3,
  className
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50"
        />
      ))}
    </div>
  );
}

export function ErrorBlock({
  title = 'We could not load this content',
  message,
  onRetry
}: {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-semibold text-red-900">{title}</p>
          <p className="mt-1 text-sm text-red-800">
            {message ?? 'Please try again. If the problem continues, contact us directly.'}
          </p>
          {onRetry ? (
            <Button variant="outline" small className="mt-4" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Alert({
  tone = 'info',
  title,
  children
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-950',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
    danger: 'border-red-200 bg-red-50 text-red-950'
  } as const;
  return (
    <div className={cn('rounded-xl border p-4 text-sm leading-6', styles[tone])} role="status">
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      {children}
    </div>
  );
}
