import { CatalogManagerPage, PublishedCell, UpdatedCell } from '../../components/admin/CatalogManagerPage';
import { formatPrice } from '../../lib/format';
import { COURSE_CATEGORY_LABELS } from '../../lib/company';
import type { CourseRow } from '../../types';

export function AdminCoursesPage() {
  return (
    <CatalogManagerPage<CourseRow>
      resource="courses"
      title="Courses"
      description="Manage the training catalogue, schedules and pricing. A blank price is displayed as “price on request”, never as free."
      createLabel="New course"
      searchPlaceholder="Search courses"
      categoryOptions={Object.entries(COURSE_CATEGORY_LABELS).map(([value, label]) => ({
        value,
        label
      }))}
      sortOptions={[
        { value: 'sort_order:asc', label: 'Display order' },
        { value: 'updated_at:desc', label: 'Recently updated' },
        { value: 'created_at:desc', label: 'Newest first' },
        { value: 'title:asc', label: 'Title A–Z' },
        { value: 'price:asc', label: 'Lowest price' },
        { value: 'price:desc', label: 'Highest price' }
      ]}
      columns={[
        { label: 'Course' },
        { label: 'Category' },
        { label: 'Price' },
        { label: 'Delivery' },
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
        <span className="text-xs text-slate-600">
          {COURSE_CATEGORY_LABELS[row.category] ?? row.category}
        </span>,
        <div>
          <p className="text-sm font-semibold text-navy-900">
            {formatPrice(row.price, row.currency)}
          </p>
          <p className="text-[11px] text-slate-400">
            {row.price === null ? 'Shown as “price on request”' : row.currency}
          </p>
        </div>,
        <div className="text-xs text-slate-600">
          <p>{row.duration || 'Duration not set'}</p>
          <p className="text-[11px] text-slate-400">{row.delivery_mode || 'Delivery not set'}</p>
        </div>,
        <PublishedCell published={row.published} />,
        <div>
          <UpdatedCell value={row.updated_at} />
          <p className="mt-1 text-[11px] text-slate-400">
            {row.level ? `${row.level} · ` : ''}order {row.sort_order}
          </p>
        </div>
      ]}
      emptyMessage="No courses have been added yet. Create a course before opening course registration."
      headerNote={
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
          Registration is only offered for published courses. Enrollment is not confirmed by this
          page — staff review each registration and contact the applicant.
        </p>
      }
    />
  );
}
