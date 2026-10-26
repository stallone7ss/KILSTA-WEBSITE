import type { ReactNode } from 'react';
import { Download, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { downloadCsv } from '../../lib/api';
import { exportPath, type CatalogResource } from '../../services/admin';
import type { AdminListParams } from '../../hooks/useAdminList';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { statusTone } from '../../lib/format';

export function AdminPageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…'
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-base pl-9"
      />
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-navy-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      >
        {children}
      </select>
    </label>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {children}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="scroll-thin overflow-x-auto">{children}</div>
    </div>
  );
}

export function TableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm text-slate-500">
        {message}
      </td>
    </tr>
  );
}

export function StatusPill({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}

export function NotificationPill({ status }: { status: string }) {
  const tone =
    status === 'sent'
      ? 'success'
      : status === 'failed'
        ? 'danger'
        : status === 'pending' || status === 'skipped'
          ? 'warning'
          : 'neutral';
  const label = status === 'skipped' ? 'not sent' : status;
  return <Badge tone={tone}>{label}</Badge>;
}

export function Detail({
  label,
  children,
  className
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-navy-900">{children}</dd>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = 'teal'
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  tone?: 'teal' | 'navy' | 'gold' | 'amber';
}) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700',
    navy: 'bg-navy-50 text-navy-800',
    gold: 'bg-gold-50 text-gold-700',
    amber: 'bg-amber-50 text-amber-700'
  } as const;
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{value}</p>
        </div>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', tones[tone])}>
          {icon}
        </span>
      </div>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ExportButton({
  entity,
  params,
  label = 'Export CSV'
}: {
  entity: CatalogResource | 'quotes' | 'contacts' | 'registrations' | 'activity-logs';
  params: Partial<AdminListParams>;
  label?: string;
}) {
  const toast = useToast();

  const handleExport = async () => {
    try {
      await downloadCsv(
        exportPath(
          entity,
          {
            page: 1,
            pageSize: 100,
            ...params
          } as AdminListParams
        ),
        `kilsta-${entity}.csv`
      );
      toast.success('Export started', 'Your CSV download should begin shortly.');
    } catch {
      toast.error('Export failed', 'The CSV could not be generated. Please try again.');
    }
  };

  return (
    <Button variant="outline" small onClick={() => void handleExport()}>
      <Download className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

export function ReadOnlyNote({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
      {children}
    </p>
  );
}
