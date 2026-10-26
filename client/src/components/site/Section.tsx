import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  className
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-navy-900 pb-16 pt-14 text-white sm:pb-20 sm:pt-16',
        className
      )}
    >
      <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="absolute inset-0 grid-overlay opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-24 top-0 h-72 w-72 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 right-16 h-80 w-80 rounded-full border border-teal-300/10"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <p className="eyebrow !text-teal-300">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-300" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-navy-100 sm:text-lg">
            {description}
          </p>
        ) : null}
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow', light && '!text-teal-300')}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'mt-3 text-2xl font-bold sm:text-3xl',
          light ? 'text-white' : 'text-navy-900'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-[15px] leading-7',
            light ? 'text-navy-100' : 'text-slate-600'
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
