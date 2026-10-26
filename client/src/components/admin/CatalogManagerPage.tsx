import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  AdminPageHeader,
  ExportButton,
  FilterBar,
  FilterSelect,
  SearchInput,
  StatusPill,
  TableEmpty,
  TableWrap
} from './AdminUi';
import { CatalogFormModal } from './CatalogFormModal';
import { ErrorBlock, LoadingBlock } from '../ui/Feedback';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/Overlay';
import { Pagination } from '../ui/Pagination';
import { useAdminList, useDebouncedValue, type AdminListParams } from '../../hooks/useAdminList';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { deleteCatalogRecord, type CatalogResource } from '../../services/admin';
import { formatDateTime } from '../../lib/format';

export interface CatalogColumn {
  label: string;
  className?: string;
}

interface SortOption {
  value: string;
  label: string;
}

const WRITE_PERMISSION: Record<CatalogResource, string> = {
  services: 'content:write',
  courses: 'content:write',
  projects: 'content:write',
  products: 'products:write',
  'staff-profiles': 'staff:write'
};

const SORT_OPTIONS: SortOption[] = [
  { value: 'sort_order:asc', label: 'Display order' },
  { value: 'updated_at:desc', label: 'Recently updated' },
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'title:asc', label: 'Title A–Z' },
  { value: 'title:desc', label: 'Title Z–A' }
];

const ENTITY_NOUNS: Record<CatalogResource, string> = {
  services: 'services',
  courses: 'courses',
  projects: 'projects',
  products: 'products',
  'staff-profiles': 'public profiles'
};

export function CatalogManagerPage<T extends { id: string }>({
  resource,
  title,
  description,
  columns,
  renderRow,
  rowLabel,
  createLabel,
  categoryOptions,
  publishedFilter = true,
  searchPlaceholder = 'Search…',
  sortOptions = SORT_OPTIONS,
  defaultSort = 'sort_order',
  defaultOrder = 'asc',
  emptyMessage,
  extraActions,
  headerNote
}: {
  resource: CatalogResource;
  title: string;
  description: string;
  columns: CatalogColumn[];
  renderRow: (row: T) => ReactNode[];
  rowLabel: (row: T) => string;
  createLabel: string;
  categoryOptions?: Array<{ value: string; label: string }>;
  publishedFilter?: boolean;
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  defaultSort?: string;
  defaultOrder?: 'asc' | 'desc';
  emptyMessage?: string;
  extraActions?: (row: T, context: { reload: () => void }) => ReactNode;
  headerNote?: ReactNode;
}) {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const canWrite = hasPermission(WRITE_PERMISSION[resource]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [category, setCategory] = useState('');
  const [published, setPublished] = useState('');
  const [sort, setSort] = useState(`${defaultSort}:${defaultOrder}`);
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState<{ record: Record<string, unknown> | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const params = useMemo<AdminListParams>(() => {
    const [nextSort, nextOrder] = sort.split(':');
    return {
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      category: category || undefined,
      published: published || undefined,
      sort: nextSort,
      order: nextOrder === 'asc' ? 'asc' : 'desc'
    };
  }, [page, debouncedSearch, category, published, sort]);

  const { items, total, totalPages, loading, error, reload } = useAdminList<T>(
    `/admin/${resource}`,
    params
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, published, sort]);

  const confirmDelete = async () => {
    if (!deleteTarget || typeof deleteTarget.id !== 'string') return;
    setDeleting(true);
    try {
      await deleteCatalogRecord(resource, deleteTarget.id);
      toast.success('Record deleted', `${rowLabel(deleteTarget)} has been removed.`);
      setDeleteTarget(null);
      reload();
    } catch (caught) {
      toast.error(
        'Record not deleted',
        caught instanceof Error
          ? caught.message
          : 'The record is still in use or could not be deleted.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const columnCount = columns.length + 1;

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            {resource === 'staff-profiles' ? null : (
              <ExportButton
                entity={resource}
                params={{
                  search: debouncedSearch || undefined,
                  category: category || undefined
                }}
              />
            )}
            <Button variant="outline" small onClick={reload}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
            {canWrite ? (
              <Button small onClick={() => setFormState({ record: null })}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {createLabel}
              </Button>
            ) : null}
          </>
        }
      />

      {headerNote ? <div className="mb-5">{headerNote}</div> : null}

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} />
        {categoryOptions?.length ? (
          <FilterSelect label="Category" value={category} onChange={setCategory}>
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        ) : null}
        {publishedFilter ? (
          <FilterSelect label="Publication" value={published} onChange={setPublished}>
            <option value="">All records</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </FilterSelect>
        ) : null}
        <FilterSelect label="Sort" value={sort} onChange={setSort}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <span className="ml-auto text-xs text-slate-500">
          {total} {total === 1 ? ENTITY_NOUNS[resource].replace(/s$/, '') : ENTITY_NOUNS[resource]}
        </span>
      </FilterBar>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading && items.length === 0 ? (
        <LoadingBlock label={`Loading ${ENTITY_NOUNS[resource]}`} rows={4} />
      ) : (
        <>
          <TableWrap>
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((column) => (
                    <th key={column.label} className={`px-4 py-3 font-semibold ${column.className ?? ''}`}>
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <TableEmpty
                    colSpan={columnCount}
                    message={
                      debouncedSearch || category || published
                        ? 'No records match these filters.'
                        : emptyMessage ?? `No ${ENTITY_NOUNS[resource]} have been added yet.`
                    }
                  />
                ) : (
                  items.map((row) => (
                    <tr key={String(row.id)} className="align-top transition hover:bg-slate-50/70">
                      {renderRow(row).map((cell, index) => (
                        <td key={`${String(row.id)}-${index}`} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {extraActions ? extraActions(row, { reload }) : null}
                          {canWrite ? (
                            <>
                              <Button
                                variant="outline"
                                small
                                onClick={() => setFormState({ record: row as unknown as Record<string, unknown> })}
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Edit
                              </Button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(row)}
                                className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                aria-label={`Delete ${rowLabel(row)}`}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrap>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
          </div>
        </>
      )}

      <CatalogFormModal
        open={formState !== null}
        resource={resource}
        record={formState?.record ?? null}
        onClose={() => setFormState(null)}
        onSaved={() => reload()}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this record?"
        description={
          deleteTarget
            ? `“${rowLabel(deleteTarget)}” will be permanently removed. This action cannot be undone and is recorded in the activity log.`
            : ''
        }
        confirmLabel="Delete record"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

/** Text helpers shared by the catalogue tables. */
export function PublishedCell({ published }: { published: boolean }) {
  return <Badge tone={published ? 'success' : 'neutral'}>{published ? 'Published' : 'Draft'}</Badge>;
}

export function SampleCell({ sample }: { sample: boolean }) {
  return sample ? <Badge tone="warning">Sample</Badge> : null;
}

export function UpdatedCell({ value }: { value: string }) {
  return <span className="text-xs text-slate-500">{formatDateTime(value)}</span>;
}

export function StatusText({ value }: { value: string }) {
  return <StatusPill status={value} />;
}
