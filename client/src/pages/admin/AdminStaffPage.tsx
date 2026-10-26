import { CatalogManagerPage, UpdatedCell } from '../../components/admin/CatalogManagerPage';
import { Badge } from '../../components/ui/Badge';
import type { StaffProfileRow } from '../../types';

export function AdminStaffPage() {
  return (
    <CatalogManagerPage<StaffProfileRow>
      resource="staff-profiles"
      title="Public profiles"
      description="Manage the people shown on the public About page. Profiles are hidden unless they are explicitly marked as public."
      createLabel="Add profile"
      searchPlaceholder="Search profiles"
      publishedFilter={false}
      sortOptions={[
        { value: 'sort_order:asc', label: 'Display order' },
        { value: 'updated_at:desc', label: 'Recently updated' },
        { value: 'full_name:asc', label: 'Name A–Z' },
        { value: 'created_at:desc', label: 'Newest first' }
      ]}
      columns={[{ label: 'Profile' }, { label: 'Contact' }, { label: 'Visibility' }, { label: 'Order' }, { label: 'Updated' }]}
      rowLabel={(row) => row.full_name}
      renderRow={(row) => [
        <div>
          <p className="font-semibold text-navy-900">{row.full_name}</p>
          <p className="text-xs text-slate-500">{row.title}</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{row.bio}</p>
        </div>,
        <div className="text-xs text-slate-600">
          <p>{row.email || 'No email recorded'}</p>
          <p className="text-slate-400">{row.phone || 'No phone recorded'}</p>
        </div>,
        <Badge tone={row.is_public ? 'success' : 'neutral'}>
          {row.is_public ? 'Public' : 'Hidden'}
        </Badge>,
        <span className="text-xs text-slate-600">{row.sort_order}</span>,
        <UpdatedCell value={row.updated_at} />
      ]}
      emptyMessage="No public profiles have been added. The About page will show an honest empty state until a profile is published."
      headerNote={
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          Only publish names, roles, biographies and contact details that the person has agreed to
          share. No staff profiles are created automatically.
        </p>
      }
    />
  );
}
