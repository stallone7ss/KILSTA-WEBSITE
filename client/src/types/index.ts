export type ServiceCategory = 'business' | 'ict' | 'training';
export type ContactMethod = 'email' | 'phone';
export type NotificationStatus = 'sent' | 'failed' | 'skipped';
export type QuoteStatus =
  | 'New'
  | 'Under Review'
  | 'Quoted'
  | 'Accepted'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';
export type ContactStatus = 'New' | 'In Progress' | 'Resolved';
export type RegistrationStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_request';

export interface Service {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  summary: string;
  description: string;
  features: string[];
  icon: string | null;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  level: string | null;
  duration: string | null;
  price: number | null;
  currency: string;
  schedule: string | null;
  delivery_mode: string | null;
  sort_order: number;
}

export interface ProjectImage {
  id: string;
  image_url: string;
  alt_text: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  summary: string;
  description: string;
  completed_at: string | null;
  featured: boolean;
  sort_order: number;
  images: ProjectImage[];
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  currency: string;
  image_url: string | null;
  availability: ProductAvailability;
  sort_order: number;
}

export interface StaffProfile {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  photo_url: string | null;
  sort_order: number;
}

export interface CompanyProfile {
  name: string;
  shortName: string;
  tagline: string;
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  postalAddress: string;
  registrationNumber: string;
  tin: string;
}

export interface HomepageCopy {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  supportingNote: string;
}

export interface SiteSettings {
  company_profile: CompanyProfile | null;
  homepage: HomepageCopy | null;
}

export interface SubmissionReceipt {
  reference: string | null;
  submittedAt: string;
  notifications: {
    customer: NotificationStatus;
    business: NotificationStatus;
  };
  message: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/* --------------------------- administrative types -------------------------- */

export interface AdminUserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
}

export interface AdminMe {
  user: { id: string; email: string };
  profile: AdminUserProfile | null;
  roles: Array<'admin' | 'staff'>;
  permissions: string[];
}

export interface DashboardData {
  quotes: {
    total: number;
    byStatus: Record<string, number>;
    unassigned: number;
    recent: Array<{
      id: string;
      reference: string;
      full_name: string;
      requested_service: string;
      status: QuoteStatus;
      created_at: string;
    }>;
  };
  contacts: {
    total: number;
    newCount: number;
    recent: Array<{
      id: string;
      full_name: string;
      subject: string;
      status: ContactStatus;
      created_at: string;
    }>;
  };
  registrations: { total: number; pending: number };
  catalog: {
    publishedServices: number;
    publishedCourses: number;
    publishedProjects: number;
    publishedProducts: number;
    lowStockProducts: number;
  };
}

export interface QuoteRequestRow {
  id: string;
  reference: string;
  full_name: string;
  organization: string | null;
  email: string;
  phone: string;
  service_category: ServiceCategory;
  requested_service: string;
  project_description: string;
  preferred_contact_method: ContactMethod;
  budget_range: string | null;
  preferred_completion_date: string | null;
  contact_consent: boolean;
  status: QuoteStatus;
  assigned_to: string | null;
  internal_notes: string | null;
  customer_notification_status: NotificationStatus | 'pending';
  business_notification_status: NotificationStatus | 'pending';
  notification_attempted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  subject: string;
  message: string;
  contact_consent: boolean;
  status: ContactStatus;
  internal_notes: string | null;
  customer_notification_status: NotificationStatus | 'pending';
  business_notification_status: NotificationStatus | 'pending';
  notification_attempted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseRegistrationRow {
  id: string;
  reference: string;
  course_id: string;
  course_title?: string | null;
  full_name: string;
  email: string;
  phone: string;
  organization: string | null;
  preferred_start_date: string | null;
  message: string | null;
  contact_consent: boolean;
  status: RegistrationStatus;
  internal_notes: string | null;
  customer_notification_status: NotificationStatus | 'pending';
  business_notification_status: NotificationStatus | 'pending';
  notification_attempted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  summary: string;
  description: string;
  features: string[];
  icon: string | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  level: string | null;
  duration: string | null;
  price: number | null;
  currency: string;
  schedule: string | null;
  delivery_mode: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  client_name: string | null;
  summary: string;
  description: string;
  completed_at: string | null;
  featured: boolean;
  published: boolean;
  is_sample: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  currency: string;
  stock_quantity: number;
  low_stock_threshold: number;
  track_stock: boolean;
  image_url: string | null;
  published: boolean;
  is_sample: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StaffProfileRow {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_hash: string | null;
  created_at: string;
}

export interface PublicUserRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  roles: Array<'admin' | 'staff'>;
}
