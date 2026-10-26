-- =============================================================================
-- Migration 0003: SQL grants
--
-- RLS and grants are separate controls. Supabase grants broad privileges to the
-- anon/authenticated roles by default, so we revoke and re-grant the minimum.
-- The service_role is used exclusively by the Express API on the server.
-- =============================================================================

-- Remove default privileges for browser-facing roles on all application tables.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Allow use of the schema (RLS still applies).
grant usage on schema public to anon, authenticated;

-- Public catalogue reads.
grant select on public.services to anon, authenticated;
grant select on public.courses to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant select on public.project_images to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.staff_profiles to anon, authenticated;

-- Signed-in users: limited access to their own profile and roles (RLS restricts rows).
grant select on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- The trusted server role needs full access to application tables. Supabase's
-- service_role already has BYPASSRLS; these grants make the intent explicit.
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Future tables created by migrations should not inherit browser access.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
