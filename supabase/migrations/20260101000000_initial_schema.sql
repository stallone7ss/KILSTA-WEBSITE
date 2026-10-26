-- =============================================================================
-- KILSTA Business & ICT Consultants
-- Migration 0001: core schema
-- Apply with the Supabase CLI (see docs/DATABASE_SETUP.md). Never run destructive
-- reset commands against a production project.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Shared helper: updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles (one row per Supabase Auth user)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create a profile automatically when an Auth user is provisioned. Sign-ups are
-- disabled in Supabase Auth; users are invited/created by an administrator.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- user_roles (administrative authorisation)
-- -----------------------------------------------------------------------------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index user_roles_user_id_idx on public.user_roles (user_id);
create index user_roles_role_idx on public.user_roles (role);

-- -----------------------------------------------------------------------------
-- services (business, ICT) and training service offerings
-- -----------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null check (category in ('business', 'ict', 'training')),
  summary text not null,
  description text not null default '',
  features text[] not null default '{}',
  icon text,
  image_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_category_published_idx on public.services (category, published);
create index services_sort_order_idx on public.services (sort_order);

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- quote_requests
-- -----------------------------------------------------------------------------
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  full_name text not null,
  organization text,
  email text not null,
  phone text not null,
  service_category text not null check (service_category in ('business', 'ict', 'training')),
  requested_service text not null,
  project_description text not null,
  preferred_contact_method text not null check (preferred_contact_method in ('email', 'phone')),
  budget_range text,
  preferred_completion_date date,
  contact_consent boolean not null default false,
  status text not null default 'New'
    check (status in ('New', 'Under Review', 'Quoted', 'Accepted', 'In Progress', 'Completed', 'Rejected')),
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text,
  customer_notification_status text not null default 'pending'
    check (customer_notification_status in ('pending', 'sent', 'failed', 'skipped')),
  business_notification_status text not null default 'pending'
    check (business_notification_status in ('pending', 'sent', 'failed', 'skipped')),
  notification_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quote_requests_status_idx on public.quote_requests (status);
create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index quote_requests_email_idx on public.quote_requests (lower(email));
create index quote_requests_assigned_to_idx on public.quote_requests (assigned_to);

create trigger quote_requests_set_updated_at
before update on public.quote_requests
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- contact_messages
-- -----------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  organization text,
  subject text not null,
  message text not null,
  contact_consent boolean not null default false,
  status text not null default 'New'
    check (status in ('New', 'In Progress', 'Resolved')),
  internal_notes text,
  customer_notification_status text not null default 'pending'
    check (customer_notification_status in ('pending', 'sent', 'failed', 'skipped')),
  business_notification_status text not null default 'pending'
    check (business_notification_status in ('pending', 'sent', 'failed', 'skipped')),
  notification_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- courses and course registrations
-- -----------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null default 'other'
    check (category in ('basic-computing', 'microsoft-office', 'software-training', 'internet-services', 'other')),
  summary text not null,
  description text not null default '',
  level text,
  duration text,
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'PGK',
  schedule text,
  delivery_mode text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_published_idx on public.courses (published);
create index courses_category_idx on public.courses (category);
create index courses_sort_order_idx on public.courses (sort_order);

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create table public.course_registrations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  course_id uuid not null references public.courses (id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  organization text,
  preferred_start_date date,
  message text,
  contact_consent boolean not null default false,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  internal_notes text,
  customer_notification_status text not null default 'pending'
    check (customer_notification_status in ('pending', 'sent', 'failed', 'skipped')),
  business_notification_status text not null default 'pending'
    check (business_notification_status in ('pending', 'sent', 'failed', 'skipped')),
  notification_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index course_registrations_course_id_idx on public.course_registrations (course_id);
create index course_registrations_status_idx on public.course_registrations (status);
create index course_registrations_created_at_idx on public.course_registrations (created_at desc);

create trigger course_registrations_set_updated_at
before update on public.course_registrations
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- projects and project images
-- -----------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null check (category in ('business', 'ict', 'training')),
  client_name text,
  summary text not null,
  description text not null default '',
  completed_at date,
  featured boolean not null default false,
  published boolean not null default false,
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_category_published_idx on public.projects (category, published);
create index projects_sort_order_idx on public.projects (sort_order);

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index project_images_project_id_idx on public.project_images (project_id);

-- -----------------------------------------------------------------------------
-- products and stock
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  category text not null default 'General',
  description text not null default '',
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'PGK',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  track_stock boolean not null default true,
  image_url text,
  published boolean not null default false,
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_published_idx on public.products (published);
create index products_category_idx on public.products (category);
create index products_sort_order_idx on public.products (sort_order);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- site settings (public content is served through the API, not direct table reads)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- staff profiles (only published profiles are publicly readable)
-- -----------------------------------------------------------------------------
create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  bio text not null default '',
  photo_url text,
  email text,
  phone text,
  is_public boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_profiles_public_idx on public.staff_profiles (is_public, sort_order);

create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- activity logs (audit trail written by the trusted API)
-- -----------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index activity_logs_actor_id_idx on public.activity_logs (actor_id);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- Role helpers used by RLS policies
-- -----------------------------------------------------------------------------
create or replace function public.current_user_has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'staff')
  );
$$;

revoke execute on function public.current_user_has_role(text) from public, anon;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.current_user_has_role(text) to authenticated;
grant execute on function public.is_staff() to authenticated;
