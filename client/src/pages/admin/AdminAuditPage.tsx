import { useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import {
  AdminPageHeader,
  ExportButton,
  FilterBar,
  FilterSelect,
  SearchInput,
  TableEmpty,
  TableWrap
} from '../../components/admin/AdminUi';
import { ErrorBlock, LoadingBlock } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Overlay';
import { Pagination } from '../../components/ui/Pagination';
import { useAdminList, useDebouncedValue, type AdminListParams } from '../../hooks/useAdminList';
import { formatDateTime, humanize, truncate } from '../../lib/format';
import type { ActivityLogRow } from '../../types';

const ENTITY_TYPES = [
  'quote_requests',
  'contact_messages',
  'course_registrations',
  'services',
  'courses',
  'projects',
  'products',
  'staff-profiles',
  'project_images',
  'site_settings',
  'user_roles'
];

const ACTIONS = [
  'create',
  'update',
  'delete',
  'quote.update',
  'contact.update',
  'registration.update',
  'product.stock_update',
  'project_image.create',
  'project_image.delete',
  'settings.update',
  'user.roles_update',
  'export'
];

function MetadataModal({ row, onClose }: { row: ActivityLogRow; onClose: () => void }) {
  const metadata = row.metadata ?? {};
  return (
    <Modal
      open
      onClose={onClose}
      title="Activity detail"
      description={`${row.action} · ${row.entity_type}`}
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Time</dt>
          <dd className="mt-1 text-sm text-navy-900">{formatDateTime(row.created_at)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actor</dt>
          <dd className="mt-1 break-all text-sm text-navy-900">{row.actor_email || 'System'}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Entity
          </dt>
          <dd className="mt-1 text-sm text-navy-900">{row.entity_type}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Entity identifier
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-600">
            {row.entity_id || 'Not applicable'}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            IP hash
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-600">
            {row.ip_hash || 'Not recorded'}
          </dd>
        </div>
      </dl>
      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Metadata
        </p>
        <pre className="scroll-thin mt-2 max-h-80 overflow-auto rounded-xl bg-navy-950 p-4 text-[11px] leading-5 text-navy-100">
          {JSON.stringify(metadata, null, 2)}
        </pre>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">
          IP addresses are stored as salted hashes. Metadata never contains form message bodies.
        </p>
      </div>
    </Modal>
  );
}

export function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [sort, setSort] = useState('created_at:desc');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ActivityLogRow | null>(null);

  const params = useMemo<AdminListParams>(() => {
    const [nextSort, nextOrder] = sort.split(':');
    return {
      page,
      pageSize: 25,
      search: debouncedSearch || undefined,
      entityType: entityType || undefined,
      action: action || undefined,
      sort: nextSort,
      order: nextOrder === 'asc' ? 'asc' : 'desc'
    };
  }, [page, debouncedSearch, entityType, action, sort]);

  const { items, total, totalPages, loading, error, reload } = useAdminList<ActivityLogRow>(
    '/admin/activity-logs',
    params
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, entityType, action, sort]);

  return (
    <>
      <AdminPageHeader
        title="Activity log"
        description="Immutable records of administrative actions. IP addresses are stored as salted hashes and no form message bodies are copied into the log."
        actions={
          <>
            <ExportButton
              entity="activity-logs"
              params={{
                search: debouncedSearch || undefined,
                entityType: entityType || undefined,
                action: action || undefined
              }}
            />
            <Button variant="outline" small onClick={reload}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search actor, action or entity" />
        <FilterSelect label="Entity" value={entityType} onChange={setEntityType}>
          <option value="">All entities</option>
          {ENTITY_TYPES.map((entry) => (
            <option key={entry} value={entry}>
              {humanize(entry)}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Action" value={action} onChange={setAction}>
          <option value="">All actions</option>
          {ACTIONS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Sort" value={sort} onChange={setSort}>
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          <option value="action:asc">Action A–Z</option>
          <option value="entity_type:asc">Entity A–Z</option>
        </FilterSelect>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          {total} entr{total === 1 ? 'y' : 'ies'}
        </span>
      </FilterBar>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading && items.length === 0 ? (
        <LoadingBlock label="Loading activity log" rows={5} />
      ) : (
        <>
          <TableWrap>
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 text-right font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <TableEmpty
                    colSpan={6}
                    message={
                      debouncedSearch || entityType || action
                        ? 'No activity entries match these filters.'
                        : 'No administrative activity has been recorded yet.'
                    }
                  />
                ) : (
                  items.map((row) => {
                    const hasMetadata =
                      row.metadata && Object.keys(row.metadata as Record<string, unknown>).length > 0;
                    return (
                      <tr key={row.id} className="transition hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDateTime(row.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-navy-900">
                            {row.actor_email || 'System'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {row.ip_hash ? truncate(row.ip_hash, 18) : 'No IP hash'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={row.action === 'delete' ? 'danger' : 'info'}>
                            {row.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {humanize(row.entity_type)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] text-slate-500">
                            {row.entity_id ? truncate(row.entity_id, 14) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            small
                            onClick={() => setDetail(row)}
                            disabled={!hasMetadata}
                          >
                            {hasMetadata ? 'View' : 'No detail'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableWrap>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
          </div>
        </>
      )}

      {detail ? <MetadataModal row={detail} onClose={() => setDetail(null)} /> : null}
    </>
  );
}
