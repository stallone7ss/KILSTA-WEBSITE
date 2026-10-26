import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Save,
  Sparkles
} from 'lucide-react';
import { useAdminList, useDebouncedValue, type AdminListParams } from '../../hooks/useAdminList';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import {
  ExportButton,
  AdminPageHeader,
  Detail,
  FilterBar,
  FilterSelect,
  NotificationPill,
  SearchInput,
  StatusPill,
  TableEmpty,
  TableWrap
} from '../../components/admin/AdminUi';
import { ErrorBlock, LoadingBlock, Spinner } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer, ConfirmDialog } from '../../components/ui/Overlay';
import { Pagination } from '../../components/ui/Pagination';
import { getQuote, updateQuote, updateQuoteStatus } from '../../services/admin';
import { QUOTE_STATUSES, QUOTE_TRANSITIONS } from '../../lib/workflow';
import { formatDate, formatDateTime, humanize } from '../../lib/format';
import type { QuoteRequestRow, QuoteStatus } from '../../types';
import { SERVICE_CATEGORIES } from '../../lib/company';

function QuoteDrawer({
  quoteId,
  onClose,
  onUpdated
}: {
  quoteId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useApi(
    () => getQuote(quoteId),
    [quoteId]
  );
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<QuoteStatus | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (data) {
      setNotes(data.internal_notes ?? '');
      setNotesSaved(data.internal_notes ?? '');
    }
  }, [data]);

  const saveNotes = async () => {
    if (!data) return;
    setSavingNotes(true);
    try {
      const updated = await updateQuote(data.id, { internal_notes: notes.trim() || null });
      setData(updated);
      setNotesSaved(updated.internal_notes ?? '');
      toast.success('Notes saved');
      onUpdated();
    } catch {
      toast.error('Notes not saved', 'Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const applyTransition = async () => {
    if (!pendingStatus) return;
    setTransitioning(true);
    try {
      const updated = await updateQuoteStatus(quoteId, pendingStatus);
      setData(updated);
      setPendingStatus(null);
      toast.success('Quote status updated', `Now marked as ${updated.status}.`);
      onUpdated();
    } catch (caught) {
      toast.error(
        'Status not updated',
        caught instanceof Error ? caught.message : 'Please try again.'
      );
    } finally {
      setTransitioning(false);
    }
  };

  const allowed = data ? QUOTE_TRANSITIONS[data.status] : [];

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={data ? `Quote ${data.reference}` : 'Quote request'}
        subtitle={data ? `${data.full_name} · received ${formatDateTime(data.created_at)}` : 'Loading request…'}
        footer={
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        }
      >
        {loading && !data ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorBlock message={error} onRetry={reload} />
        ) : data ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={data.status} />
              <Badge tone="neutral">{humanize(data.service_category)}</Badge>
              {data.assigned_to ? (
                <Badge tone="info">Assigned</Badge>
              ) : (
                <Badge tone="warning">Unassigned</Badge>
              )}
            </div>

            <section>
              <h3 className="text-sm font-semibold text-navy-900">Contact</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <Detail label="Full name">{data.full_name}</Detail>
                <Detail label="Organisation">{data.organization || 'Not provided'}</Detail>
                <Detail label="Email">
                  <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 text-teal-700 hover:underline">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {data.email}
                  </a>
                </Detail>
                <Detail label="Phone">
                  <a href={`tel:${data.phone}`} className="inline-flex items-center gap-1.5 text-teal-700 hover:underline">
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {data.phone}
                  </a>
                </Detail>
                <Detail label="Preferred contact">{humanize(data.preferred_contact_method)}</Detail>
                <Detail label="Consent recorded">{data.contact_consent ? 'Yes' : 'No'}</Detail>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-navy-900">Request</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <Detail label="Requested service">{data.requested_service}</Detail>
                <Detail label="Service category">{humanize(data.service_category)}</Detail>
                <Detail label="Budget range">{data.budget_range || 'Not provided'}</Detail>
                <Detail label="Preferred completion">
                  {formatDate(data.preferred_completion_date)}
                </Detail>
              </dl>
              <div className="mt-4">
                <Detail label="Project description">
                  <p className="whitespace-pre-wrap">{data.project_description}</p>
                </Detail>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy-900">Notifications</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Customer email:</span>
                <NotificationPill status={data.customer_notification_status} />
                <span className="ml-2">Business email:</span>
                <NotificationPill status={data.business_notification_status} />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Email is sent only when the server is configured with a mail provider. A status of
                “not sent” means no message was delivered by this deployment.
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-navy-900">Internal notes</h3>
                <Button
                  variant="outline"
                  small
                  onClick={() => void saveNotes()}
                  loading={savingNotes}
                  disabled={notes.trim() === notesSaved.trim()}
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  Save notes
                </Button>
              </div>
              <label htmlFor="quote-notes" className="sr-only">
                Internal notes
              </label>
              <textarea
                id="quote-notes"
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="input-base mt-3 resize-y"
                placeholder="Record follow-up actions, scope clarifications or internal decisions. Notes are not shown to the customer."
              />
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy-900">Update status</h3>
              {allowed.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  This request is complete and no further status changes are available.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {allowed.map((status) => (
                    <Button
                      key={status}
                      variant={status === 'Rejected' ? 'outline' : 'primary'}
                      small
                      onClick={() => setPendingStatus(status)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      {status}
                    </Button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                Status changes are recorded in the activity log. A quote request is not a price
                commitment until scope and terms are confirmed in writing.
              </div>
            </section>

            <section className="border-t border-slate-200 pt-4">
              <dl className="grid gap-3 text-xs sm:grid-cols-2">
                <Detail label="Reference">{data.reference}</Detail>
                <Detail label="Last updated">{formatDateTime(data.updated_at)}</Detail>
                <Detail label="Notification attempted">
                  {data.notification_attempted_at
                    ? formatDateTime(data.notification_attempted_at)
                    : 'Not attempted'}
                </Detail>
              </dl>
            </section>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change quote status?"
        description={
          pendingStatus
            ? `Move this request from “${data?.status ?? ''}” to “${pendingStatus}”? The customer is not emailed automatically by this action.`
            : ''
        }
        confirmLabel={pendingStatus === 'Rejected' ? 'Mark as rejected' : 'Update status'}
        destructive={pendingStatus === 'Rejected'}
        loading={transitioning}
        onConfirm={() => void applyTransition()}
        onCancel={() => setPendingStatus(null)}
      />
    </>
  );
}

export function AdminQuotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState(
    initialStatus && QUOTE_STATUSES.includes(initialStatus as QuoteStatus) ? initialStatus : ''
  );
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(searchParams.get('open'));

  const params = useMemo<AdminListParams>(
    () => ({
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      status: status || undefined,
      category: category || undefined,
      sort,
      order
    }),
    [page, debouncedSearch, status, category, sort, order]
  );

  const { items, total, totalPages, loading, error, reload } = useAdminList<QuoteRequestRow>(
    '/admin/quotes',
    params
  );

  useEffect(() => {
    const nextStatus = searchParams.get('status');
    if (nextStatus && QUOTE_STATUSES.includes(nextStatus as QuoteStatus)) {
      setStatus(nextStatus);
      setPage(1);
    }
    const nextOpen = searchParams.get('open');
    if (nextOpen) setOpenId(nextOpen);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, sort, order]);

  const closeDrawer = () => {
    setOpenId(null);
    if (searchParams.has('open')) {
      const next = new URLSearchParams(searchParams);
      next.delete('open');
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quote requests"
        description="Review incoming requests, keep internal notes and move each request through the agreed workflow."
        actions={
          <>
            <ExportButton
              entity="quotes"
              params={{ search: debouncedSearch || undefined, status: status || undefined, category: category || undefined }}
            />
            <Button variant="outline" small onClick={reload}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search reference, name or email"
        />
        <FilterSelect label="Status" value={status} onChange={setStatus}>
          <option value="">All statuses</option>
          {QUOTE_STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Category" value={category} onChange={setCategory}>
          <option value="">All categories</option>
          {SERVICE_CATEGORIES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
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
          <option value="status:asc">Status</option>
        </FilterSelect>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          {total} request{total === 1 ? '' : 's'}
        </span>
      </FilterBar>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading && items.length === 0 ? (
        <LoadingBlock label="Loading quote requests" rows={4} />
      ) : (
        <>
          <TableWrap>
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference / name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Requested</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <TableEmpty
                    colSpan={6}
                    message={
                      debouncedSearch || status || category
                        ? 'No quote requests match these filters.'
                        : 'No quote requests have been received yet.'
                    }
                  />
                ) : (
                  items.map((quote) => (
                    <tr key={quote.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-left font-semibold text-navy-900 hover:text-teal-700"
                          onClick={() => setOpenId(quote.id)}
                        >
                          {quote.reference}
                        </button>
                        <p className="text-xs text-slate-500">{quote.full_name}</p>
                        {quote.organization ? (
                          <p className="text-[11px] text-slate-400">{quote.organization}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <a href={`mailto:${quote.email}`} className="block hover:text-teal-700">
                          {quote.email}
                        </a>
                        <span>{quote.phone}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{quote.requested_service}</p>
                        <p className="text-[11px] capitalize text-slate-400">{quote.service_category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={quote.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(quote.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" small onClick={() => setOpenId(quote.id)}>
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

      {openId ? (
        <QuoteDrawer
          quoteId={openId}
          onClose={closeDrawer}
          onUpdated={() => {
            reload();
          }}
        />
      ) : null}
    </>
  );
}
