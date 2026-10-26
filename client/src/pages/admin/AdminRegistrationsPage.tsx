import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Phone, RefreshCw, Save } from 'lucide-react';
import { useAdminList, useDebouncedValue, type AdminListParams } from '../../hooks/useAdminList';
import { useToast } from '../../hooks/useToast';
import {
  AdminPageHeader,
  Detail,
  ExportButton,
  FilterBar,
  FilterSelect,
  NotificationPill,
  SearchInput,
  StatusPill,
  TableEmpty,
  TableWrap
} from '../../components/admin/AdminUi';
import { ErrorBlock, LoadingBlock } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Drawer, ConfirmDialog } from '../../components/ui/Overlay';
import { Pagination } from '../../components/ui/Pagination';
import { updateRegistration } from '../../services/admin';
import { REGISTRATION_STATUSES, REGISTRATION_TRANSITIONS } from '../../lib/workflow';
import { formatDate, formatDateTime } from '../../lib/format';
import type { CourseRegistrationRow, RegistrationStatus } from '../../types';

function RegistrationDrawer({
  row,
  onClose,
  onUpdated
}: {
  row: CourseRegistrationRow;
  onClose: () => void;
  onUpdated: (next: CourseRegistrationRow) => void;
}) {
  const toast = useToast();
  const [notes, setNotes] = useState(row.internal_notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<RegistrationStatus | null>(null);
  const [updating, setUpdating] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const updated = await updateRegistration(row.id, { internal_notes: notes.trim() || null });
      onUpdated(updated);
      toast.success('Notes saved');
    } catch {
      toast.error('Notes not saved', 'Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const applyStatus = async () => {
    if (!pendingStatus) return;
    setUpdating(true);
    try {
      const updated = await updateRegistration(row.id, { status: pendingStatus });
      onUpdated(updated);
      setPendingStatus(null);
      toast.success('Registration updated', `Now marked as ${updated.status}.`);
    } catch (caught) {
      toast.error(
        'Status not updated',
        caught instanceof Error ? caught.message : 'Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const allowed = REGISTRATION_TRANSITIONS[row.status];

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={row.reference}
        subtitle={`${row.full_name} · ${formatDateTime(row.created_at)}`}
        footer={
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={row.status} />
            <NotificationPill status={row.customer_notification_status} />
            <NotificationPill status={row.business_notification_status} />
          </div>

          <section>
            <h3 className="text-sm font-semibold text-navy-900">Applicant</h3>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <Detail label="Full name">{row.full_name}</Detail>
              <Detail label="Organisation">{row.organization || 'Not provided'}</Detail>
              <Detail label="Email">
                <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 text-teal-700 hover:underline">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {row.email}
                </a>
              </Detail>
              <Detail label="Phone">
                <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 text-teal-700 hover:underline">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {row.phone}
                </a>
              </Detail>
              <Detail label="Consent recorded">{row.contact_consent ? 'Yes' : 'No'}</Detail>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-navy-900">Course</h3>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <Detail label="Course">{row.course_title || 'Course title unavailable'}</Detail>
              <Detail label="Preferred start">{formatDate(row.preferred_start_date)}</Detail>
            </dl>
            {row.message ? (
              <div className="mt-4">
                <Detail label="Applicant message">
                  <p className="whitespace-pre-wrap">{row.message}</p>
                </Detail>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-navy-900">Internal notes</h3>
              <Button
                variant="outline"
                small
                onClick={() => void saveNotes()}
                loading={savingNotes}
                disabled={notes.trim() === (row.internal_notes ?? '').trim()}
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Save notes
              </Button>
            </div>
            <label htmlFor="registration-notes" className="sr-only">
              Internal notes
            </label>
            <textarea
              id="registration-notes"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="input-base mt-3 resize-y"
              placeholder="Record confirmation calls, payment arrangements or attendance notes. Notes are not shown to the applicant."
            />
          </section>

          <section>
            <h3 className="text-sm font-semibold text-navy-900">Status</h3>
            {allowed.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                This registration is complete and no further status changes are available.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {allowed.map((entry) => (
                  <Button
                    key={entry}
                    variant={entry === 'Cancelled' ? 'outline' : 'primary'}
                    small
                    onClick={() => setPendingStatus(entry)}
                  >
                    {entry}
                  </Button>
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-slate-200 pt-4">
            <dl className="grid gap-3 text-xs sm:grid-cols-2">
              <Detail label="Last updated">{formatDateTime(row.updated_at)}</Detail>
              <Detail label="Notification attempted">
                {row.notification_attempted_at
                  ? formatDateTime(row.notification_attempted_at)
                  : 'Not attempted'}
              </Detail>
            </dl>
          </section>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change registration status?"
        description={
          pendingStatus
            ? `Move this registration from “${row.status}” to “${pendingStatus}”? No automatic email is sent by this action.`
            : ''
        }
        confirmLabel={pendingStatus === 'Cancelled' ? 'Cancel registration' : 'Update status'}
        destructive={pendingStatus === 'Cancelled'}
        loading={updating}
        onConfirm={() => void applyStatus()}
        onCancel={() => setPendingStatus(null)}
      />
    </>
  );
}

export function AdminRegistrationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(searchParams.get('open'));
  const [selectedOverride, setSelectedOverride] = useState<CourseRegistrationRow | null>(null);

  const params = useMemo<AdminListParams>(
    () => ({
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      status: status || undefined,
      sort,
      order
    }),
    [page, debouncedSearch, status, sort, order]
  );

  const { items, total, totalPages, loading, error, reload } =
    useAdminList<CourseRegistrationRow>('/admin/registrations', params);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sort, order]);

  useEffect(() => {
    const nextOpen = searchParams.get('open');
    if (nextOpen) setOpenId(nextOpen);
    const nextStatus = searchParams.get('status');
    if (nextStatus) setStatus(nextStatus);
  }, [searchParams]);

  const selected = selectedOverride ?? items.find((row) => row.id === openId) ?? null;

  const closeDrawer = () => {
    setOpenId(null);
    setSelectedOverride(null);
    if (searchParams.has('open')) {
      const next = new URLSearchParams(searchParams);
      next.delete('open');
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Course registrations"
        description="Review training registrations and record confirmation, completion or cancellation."
        actions={
          <>
            <ExportButton
              entity="registrations"
              params={{ search: debouncedSearch || undefined, status: status || undefined }}
            />
            <Button variant="outline" small onClick={reload}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or reference" />
        <FilterSelect label="Status" value={status} onChange={setStatus}>
          <option value="">All statuses</option>
          {REGISTRATION_STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Sort" value={`${sort}:${order}`} onChange={(value) => {
          const [nextSort, nextOrder] = value.split(':');
          setSort(nextSort);
          setOrder(nextOrder === 'asc' ? 'asc' : 'desc');
        }}>
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          <option value="updated_at:desc">Recently updated</option>
          <option value="full_name:asc">Name A–Z</option>
        </FilterSelect>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          {total} registration{total === 1 ? '' : 's'}
        </span>
      </FilterBar>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading && items.length === 0 ? (
        <LoadingBlock label="Loading registrations" rows={4} />
      ) : (
        <>
          <TableWrap>
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Preferred start</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <TableEmpty
                    colSpan={6}
                    message={
                      debouncedSearch || status
                        ? 'No registrations match these filters.'
                        : 'No course registrations have been received yet.'
                    }
                  />
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-left font-semibold text-navy-900 hover:text-teal-700"
                          onClick={() => {
                            setSelectedOverride(row);
                            setOpenId(row.id);
                          }}
                        >
                          {row.full_name}
                        </button>
                        <p className="text-[11px] text-slate-400">{row.reference}</p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                      </td>
                      <td className="max-w-[240px] px-4 py-3">
                        <p className="truncate text-slate-700">
                          {row.course_title || 'Course title unavailable'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(row.preferred_start_date)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          small
                          onClick={() => {
                            setSelectedOverride(row);
                            setOpenId(row.id);
                          }}
                        >
                          Open
                        </Button>
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

      {openId && selected ? (
        <RegistrationDrawer
          row={selected}
          onClose={closeDrawer}
          onUpdated={(next) => {
            setSelectedOverride(next);
            reload();
          }}
        />
      ) : null}
    </>
  );
}
