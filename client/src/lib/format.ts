export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-PG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-PG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function formatPrice(
  price: number | null | undefined,
  currency = 'PGK'
): string {
  if (price === null || price === undefined) return 'Price on request';
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(price);
}

export function humanize(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'teal';

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'New':
    case 'Pending':
      return 'info';
    case 'Under Review':
    case 'Quoted':
    case 'Confirmed':
      return 'warning';
    case 'Accepted':
    case 'In Progress':
      return 'teal';
    case 'Completed':
    case 'Resolved':
      return 'success';
    case 'Rejected':
    case 'Cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function truncate(value: string, length = 90): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}
