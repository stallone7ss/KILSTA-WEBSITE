import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Clock,
  Cpu,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  MapPin,
  Monitor,
  Network,
  Package,
  PenTool,
  Phone,
  Shield,
  ShoppingCart,
  TrendingUp,
  Users,
  Wifi,
  Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { COURSE_CATEGORY_LABELS, SERVICE_CATEGORIES } from '../../lib/company';
import { formatDate, formatPrice, humanize } from '../../lib/format';
import type { Course, Product, Project, Service } from '../../types';
import { Badge } from '../ui/Badge';

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Cpu,
  FileText,
  GraduationCap,
  Layers,
  Monitor,
  Network,
  Package,
  PenTool,
  Phone,
  Shield,
  ShoppingCart,
  TrendingUp,
  Users,
  Wifi,
  Wrench,
  Image: ImageIcon
};

const availabilityTone = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
  on_request: 'neutral'
} as const;

const availabilityLabel = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  on_request: 'Availability on request'
} as const;

export function categoryLabel(category: string): string {
  return (
    SERVICE_CATEGORIES.find((item) => item.value === category)?.label ??
    humanize(category)
  );
}

export function ServiceIcon({
  name,
  className = 'h-5 w-5'
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && iconMap[name]) || Briefcase;
  return <Icon className={className} aria-hidden="true" />;
}

export function ServiceCard({ service }: { service: Service }) {
  const category = service.category === 'training' ? 'training' : service.category;
  return (
    <article className="card-surface group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-500 group-hover:text-white">
          <ServiceIcon name={service.icon} />
        </span>
        <Badge tone="teal">{categoryLabel(category)}</Badge>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-900">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{service.summary}</p>
      {service.features.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {service.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
      <Link
        to={`/quote?category=${service.category}&service=${encodeURIComponent(service.title)}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
      >
        Request this service
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="card-surface flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="teal">{COURSE_CATEGORY_LABELS[course.category] ?? humanize(course.category)}</Badge>
        {course.level ? <Badge>{course.level}</Badge> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-navy-900">{course.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.summary}</p>
      <dl className="mt-5 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-teal-600" aria-hidden="true" />
          <dt className="sr-only">Duration</dt>
          <dd>{course.duration ?? 'Duration discussed on enquiry'}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-teal-600" aria-hidden="true" />
          <dt className="sr-only">Delivery</dt>
          <dd>{course.delivery_mode ?? 'Delivery mode discussed on enquiry'}</dd>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-teal-600" aria-hidden="true" />
          <dt className="sr-only">Schedule</dt>
          <dd>{course.schedule ?? 'Schedule arranged with participants'}</dd>
        </div>
      </dl>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <p className="text-base font-bold text-navy-900">{formatPrice(course.price, course.currency)}</p>
        <Link to={`/training/register?course=${course.id}`} className="btn-primary btn-sm">
          Register interest
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card-surface flex h-full flex-col overflow-hidden">
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-navy-50 via-white to-teal-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-300">
            <Package className="h-12 w-12" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{product.category}</Badge>
          <Badge tone={availabilityTone[product.availability]}>
            {availabilityLabel[product.availability]}
          </Badge>
        </div>
        <h3 className="mt-3 text-base font-semibold text-navy-900">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-400">SKU {product.sku}</p>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
          {product.description || 'Contact us for specifications and availability.'}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-bold text-navy-900">{formatPrice(product.price, product.currency)}</p>
          <Link
            to={`/contact?subject=${encodeURIComponent(`Product enquiry: ${product.name}`)}`}
            className="btn-outline btn-sm"
          >
            Enquire
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const image = project.images[0];
  return (
    <article className="card-surface group flex h-full flex-col overflow-hidden">
      <div className="aspect-[16/10] w-full bg-gradient-to-br from-navy-100 via-navy-50 to-teal-50">
        {image ? (
          <img
            src={image.image_url}
            alt={image.alt_text || project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-navy-300">
            <Layers className="h-10 w-10" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider">Project</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{categoryLabel(project.category)}</Badge>
          {project.completed_at ? <Badge>{formatDate(project.completed_at)}</Badge> : null}
        </div>
        <h3 className="mt-3 text-base font-semibold text-navy-900">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{project.summary}</p>
        <Link
          to={`/projects/${project.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          View project
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function LocationNote() {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-slate-500">
      <MapPin className="h-4 w-4 text-teal-600" aria-hidden="true" />
      Based in Alotau, serving clients across Papua New Guinea
    </p>
  );
}
