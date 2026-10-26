import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Pagination({
  page,
  totalPages,
  total,
  onChange
}: {
  page: number;
  totalPages: number;
  total?: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return total !== undefined ? (
      <p className="text-xs text-slate-500">{total} result{total === 1 ? '' : 's'}</p>
    ) : null;
  }

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let index = Math.max(1, end - 4); index <= end; index += 1) {
    pages.push(index);
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages}
        {total !== undefined ? ` · ${total} result${total === 1 ? '' : 's'}` : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onChange(pageNumber)}
            aria-current={pageNumber === page ? 'page' : undefined}
            className={cn(
              'min-w-9 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
              pageNumber === page
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
