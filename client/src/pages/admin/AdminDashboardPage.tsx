import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Quote as QuoteIcon,
  RefreshCw,
  TriangleAlert
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getDashboard } from '../../services/admin';
import { formatDateTime } from '../../lib/format';
import { AdminPageHeader, MetricCard, StatusPill, TableEmpty, TableWrap } from '../../components/admin/AdminUi';
import { ErrorBlock, LoadingBlock } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Badge';

const PIPELINE = ['New', 'Under Review', 'Quoted', 'Accepted', 'In Progress', 'Completed', 'Rejected'];

export function AdminDashboardPage() {
  const { data, loading, error, reload } = useApi(() => getDashboard(), []);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="A current view of enquiries, registrations and published website content. Figures come directly from the database."
        actions={
          <button type="button" className="btn-outline btn-sm" onClick={reload}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        }
      />

      {error ? (
        <div className="mb-6">
          <ErrorBlock message={error} onRetry={reload} />
        </div>
      ) : null}

      {loading && !data ? (
        <LoadingBlock label="Loading dashboard" rows={4} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="New quote requests"
              value={data.quotes.byStatus.New ?? 0}
              hint={`${data.quotes.total} total · ${data.quotes.unassigned} unassigned`}
              icon={<QuoteIcon className="h-4 w-4" aria-hidden="true" />}
            />
            <MetricCard
              label="Under review"
              value={data.quotes.byStatus['Under Review'] ?? 0}
              hint="Quotes being assessed"
              icon={<BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />}
              tone="navy"
            />
            <MetricCard
              label="New contact messages"
              value={data.contacts.newCount}
              hint={`${data.contacts.total} messages in total`}
              icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
              tone="gold"
            />
            <MetricCard
              label="Pending registrations"
              value={data.registrations.pending}
              hint={`${data.registrations.total} registrations in total`}
              icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
              tone="amber"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            <section aria-labelledby="recent-quotes">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="recent-quotes" className="text-base font-semibold text-navy-900">
                  Recent quote requests
                </h2>
                <Link
                  to="/admin/quotes"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              <TableWrap>
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Reference / name</th>
                      <th className="px-4 py-3 font-semibold">Requested service</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.quotes.recent.length === 0 ? (
                      <TableEmpty colSpan={4} message="No quote requests have been received yet." />
                    ) : (
                      data.quotes.recent.map((quote) => (
                        <tr key={quote.id} className="transition hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/quotes?open=${quote.id}`}
                              className="font-semibold text-navy-900 hover:text-teal-700"
                            >
                              {quote.reference}
                            </Link>
                            <p className="text-xs text-slate-500">{quote.full_name}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{quote.requested_service}</td>
                          <td className="px-4 py-3">
                            <StatusPill status={quote.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {formatDateTime(quote.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableWrap>
            </section>

            <section aria-labelledby="quote-pipeline">
              <h2 id="quote-pipeline" className="mb-3 text-base font-semibold text-navy-900">
                Quote pipeline
              </h2>
              <div className="card-surface p-5">
                <ul className="space-y-2.5">
                  {PIPELINE.map((status) => {
                    const count = data.quotes.byStatus[status] ?? 0;
                    const max = Math.max(...PIPELINE.map((key) => data.quotes.byStatus[key] ?? 0), 1);
                    return (
                      <li key={status}>
                        <Link
                          to={`/admin/quotes?status=${encodeURIComponent(status)}`}
                          className="group flex items-center gap-3"
                        >
                          <span className="w-24 shrink-0 text-xs font-medium text-slate-600">
                            {status}
                          </span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <span
                              className="block h-full rounded-full bg-teal-500 transition-all"
                              style={{ width: `${Math.max((count / max) * 100, count > 0 ? 6 : 0)}%` }}
                            />
                          </span>
                          <span className="w-8 text-right text-xs font-semibold text-navy-900">
                            {count}
                          </span>
                          <ChevronRight
                            className="h-3.5 w-3.5 text-slate-300 group-hover:text-teal-600"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            <section aria-labelledby="recent-contacts">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="recent-contacts" className="text-base font-semibold text-navy-900">
                  Recent contact messages
                </h2>
                <Link
                  to="/admin/contacts"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              <div className="card-surface divide-y divide-slate-100">
                {data.contacts.recent.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-slate-500">
                    No contact messages have been received yet.
                  </p>
                ) : (
                  data.contacts.recent.map((contact) => (
                    <Link
                      key={contact.id}
                      to={`/admin/contacts?open=${contact.id}`}
                      className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-900">
                          {contact.full_name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{contact.subject}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDateTime(contact.created_at)}
                        </p>
                      </div>
                      <StatusPill status={contact.status} />
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section aria-labelledby="published-content">
              <h2 id="published-content" className="mb-3 text-base font-semibold text-navy-900">
                Published content
              </h2>
              <div className="card-surface p-5">
                <dl className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Services', value: data.catalog.publishedServices },
                    { label: 'Courses', value: data.catalog.publishedCourses },
                    { label: 'Projects', value: data.catalog.publishedProjects },
                    { label: 'Products', value: data.catalog.publishedProducts }
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {item.label}
                      </dt>
                      <dd className="mt-0.5 text-xl font-bold text-navy-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">
                      {data.catalog.lowStockProducts} product
                      {data.catalog.lowStockProducts === 1 ? '' : 's'} at or below low-stock threshold
                    </p>
                    <Link
                      to="/admin/products"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 underline"
                    >
                      Review stock
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                    Services
                  </span>
                  <Link to="/admin/services" className="font-semibold text-teal-700">
                    Manage
                  </Link>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
                    Products
                  </span>
                  <Link to="/admin/products" className="font-semibold text-teal-700">
                    Manage
                  </Link>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Data honesty
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Projects and products marked as samples are excluded from public pages. Seed data
                  remains unpublished until an administrator reviews it.
                </p>
                <Badge tone="neutral" className="mt-3">
                  Sample records hidden
                </Badge>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
