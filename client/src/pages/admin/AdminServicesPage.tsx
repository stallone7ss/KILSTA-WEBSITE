import { CatalogManagerPage, PublishedCell, UpdatedCell } from '../../components/admin/CatalogManagerPage';
import { Badge } from '../../components/ui/Badge';
import { humanize } from '../../lib/format';
import { SERVICE_CATEGORIES } from '../../lib/company';
import type { ServiceRow } from '../../types';

export function AdminServicesPage() {
  return (
    <CatalogManagerPage<ServiceRow>
      resource="services"
      title="Services"
      description="Maintain the business, ICT and training services shown on the public website. Unpublished records stay hidden."
      createLabel="New service"
      searchPlaceholder="Search services"
      categoryOptions={SERVICE_CATEGORIES.map((entry) => ({
        value: entry.value,
        label: entry.label
      }))}
      columns={[
        { label: 'Service' },
        { label: 'Category' },
        { label: 'Featured' },
        { label: 'Publication' },
        { label: 'Updated' }
      ]}
      rowLabel={(row) => row.title}
      renderRow={(row) => [
        <div>
          <p className="font-semibold text-navy-900">{row.title}</p>
          <p className="text-[11px] text-slate-400">/{row.slug}</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{row.summary}</p>
        </div>,
        <span className="text-xs capitalize text-slate-600">{humanize(row.category)}</span>,
        row.featured ? <Badge tone="teal">Featured</Badge> : <span className="text-xs text-slate-400">—</span>,
        <PublishedCell published={row.published} />,
        <div>
          <UpdatedCell value={row.updated_at} />
          <p className="mt-1 text-[11px] text-slate-400">
            {row.features?.length ?? 0} features · order {row.sort_order}
          </p>
        </div>
      ]}
      emptyMessage="No services have been added yet. Create one to begin building the public service pages."
      headerNote={
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
          Service pages are grouped by category. Only published records appear on the public
          website and in the quote form.
        </p>
      }
    />
  );
}
