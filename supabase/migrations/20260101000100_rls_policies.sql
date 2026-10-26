-- =============================================================================
-- Migration 0002: Row Level Security policies
--
-- Security model:
--   * The browser (anon / authenticated) may read only published catalogue content
--     and its own profile/roles. It can never read quote requests, contact
--     messages, course registrations, activity logs or site settings directly.
--   * All writes and all administrative operations go through the trusted Express
--     API, which verifies the Supabase JWT and roles server-side. The API uses the
--     Supabase secret key, which bypasses RLS, so it is never shipped to clients.
--   * No INSERT/UPDATE/DELETE policies are defined for public users. With RLS
--     enabled, those operations are denied even if a grant were added later.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.services enable row level security;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.courses enable row level security;
alter table public.course_registrations enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: a signed-in user may read and update only their own profile.
create policy "Profiles are readable by their owner"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Profiles are updatable by their owner"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- user_roles: users may read their own roles (authorisation decisions are still
-- made server-side; this only supports account screens).
create policy "Users can read their own roles"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

-- Public catalogue content.
create policy "Published services are publicly readable"
on public.services
for select
to anon, authenticated
using (published = true);

create policy "Published courses are publicly readable"
on public.courses
for select
to anon, authenticated
using (published = true);

create policy "Published non-sample projects are publicly readable"
on public.projects
for select
to anon, authenticated
using (published = true and is_sample = false);

create policy "Images of published projects are publicly readable"
on public.project_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_images.project_id
      and p.published = true
      and p.is_sample = false
  )
);

create policy "Published non-sample products are publicly readable"
on public.products
for select
to anon, authenticated
using (published = true and is_sample = false);

create policy "Public staff profiles are readable"
on public.staff_profiles
for select
to anon, authenticated
using (is_public = true);

-- Deliberately no policies for:
--   quote_requests, contact_messages, course_registrations,
--   site_settings, activity_logs
-- Access is restricted to the server-side service role.
