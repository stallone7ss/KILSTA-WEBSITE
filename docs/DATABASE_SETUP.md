# Database and Supabase Setup

This guide describes how to create the Supabase project, apply migrations, seed initial content, configure Auth/Storage and provision the first administrator.

> The repository contains no real project URL or keys. Create your own Supabase project and treat the secret/service-role key as a production secret.

## 1. Create a Supabase project

1. Sign in at https://supabase.com/dashboard.
2. Create a project in the region closest to Papua New Guinea (Sydney is the usual choice).
3. Record the PostgreSQL password in a password manager.
4. Open **Project Settings → API** and note:
   - Project URL → `SUPABASE_URL`
   - Publishable (anon) key → `SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Secret/service_role key → `SUPABASE_SECRET_KEY` **only** on the server

Do not put the secret key in any `VITE_` variable, any client file, or a public repository.

## 2. Apply migrations

The migrations are ordered:

| Migration | Purpose |
| --- | --- |
| `20260101000000_initial_schema.sql` | Tables, constraints, indexes, triggers, helper role functions |
| `20260101000100_rls_policies.sql` | Row-level security policies |
| `20260101000200_grants.sql` | Minimum SQL grants for browser roles |
| `20260101000300_storage.sql` | Public `media` bucket and read policy |

### Option A: Supabase CLI (recommended)

Install the CLI, then from the repository root:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

`supabase db push` applies pending migrations to the linked remote project. It does **not** run `supabase/seed.sql` against a remote database.

To verify the migration state:

```bash
supabase migration list
```

### Option B: Dashboard SQL editor

Open **SQL Editor** and run each migration file in order. Run the whole file, not individual statements. Then run `supabase/seed.sql` if you want the initial catalogue.

### Option C: Local Supabase stack (Docker required)

```bash
supabase start
supabase db reset
```

`db reset` recreates the local database, applies all migrations and runs `supabase/seed.sql`. This is also the check used by the CI migration job.

Local defaults from `supabase/config.toml`:

- API: http://localhost:54321
- Database: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio: http://localhost:54323
- Inbucket (test email): http://localhost:54324

Use the local API URL and local anon/service keys printed by `supabase start` in your `.env` files.

## 3. Seed initial content

`supabase/seed.sql` is idempotent and safe to re-run.

```bash
# Local (via db reset)
supabase db reset
```

For a remote project, paste `supabase/seed.sql` into the SQL editor, or run:

```bash
psql "postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres" -f supabase/seed.sql
```

What the seed contains:

- `company_profile` and `homepage` site settings with the supplied company details.
- Published business, ICT and training services.
- Published course records with durations/prices left `NULL` where unknown, displayed as “on request”.
- Project and product samples with `is_sample = true` and `published = false`. They are visible only to administrators and are excluded from the public API and RLS public policies.
- No staff profiles, testimonials, client counts, awards, certifications or completed-project claims.

## 4. Configure Supabase Auth

In **Authentication → URL Configuration**:

- **Site URL**: your production client origin, e.g. `https://kilsta.example.com`
- **Redirect URLs**:
  - `https://kilsta.example.com/reset-password`
  - `http://localhost:5173/reset-password`
  - `http://127.0.0.1:5173/reset-password`
  - Any Vercel preview origin you explicitly trust

In **Authentication → Providers → Email**:

- Keep email/password enabled.
- Disable public sign-ups. There is no public admin registration route and the database expects accounts to be provisioned.
- Decide whether email confirmation is required for invited accounts. If you create accounts manually with “Auto Confirm User”, confirmation is not needed.

The local `config.toml` already sets `enable_signup = false` and `enable_confirmations = false` for development.

For production password recovery, Supabase must be able to send email. Configure a custom SMTP server under **Authentication → SMTP Settings**, or use Supabase’s built-in email service for low-volume recovery mail. This is separate from the application’s quote/contact notification email settings.

## 5. Configure Storage

Migration `20260101000300_storage.sql` creates:

- Bucket: `media`
- Public read: yes
- Maximum size: 5 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Browser write policies: none

The Express API uploads with the service-role key under `media/<purpose>/<uuid>.<ext>`. Do not add public insert/update/delete policies.

If your project already has a `media` bucket, the migration updates its public flag, size limit and MIME allow-list.

## 6. Provision the first administrator

There is deliberately no self-registration.

1. Open **Authentication → Users → Add user** in the Supabase dashboard.
2. Enter the administrator’s email and a strong temporary password.
3. Enable **Auto Confirm User** so the account can sign in immediately.
4. Optionally add user metadata `{ "full_name": "Administrator Name" }`.
5. Run the SQL below in the SQL editor, replacing the email:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from public.profiles
where lower(email) = lower('ADMIN_EMAIL_HERE')
on conflict (user_id, role) do nothing;

-- Verify
select p.email, r.role
from public.profiles p
join public.user_roles r on r.user_id = p.id
where lower(p.email) = lower('ADMIN_EMAIL_HERE');
```

The `on_auth_user_created` trigger creates the matching `profiles` row automatically. If the profile row is missing, check that the trigger exists:

```sql
select tgname
from pg_trigger
where tgname = 'on_auth_user_created';
```

To add staff instead of an admin, insert role `'staff'`. Staff cannot manage users, settings, content writes, staff profiles or audit logs. An administrator can adjust roles in **Admin → Users** after signing in.

To revoke access:

```sql
delete from public.user_roles
where user_id = (select id from public.profiles where lower(email) = lower('USER_EMAIL_HERE'));
```

The Supabase Auth account still exists; delete or disable it in the dashboard if the person should no longer sign in at all.

## 7. Row-level security and grants

RLS is enabled on every application table:

`profiles`, `user_roles`, `services`, `quote_requests`, `contact_messages`, `courses`, `course_registrations`, `projects`, `project_images`, `products`, `site_settings`, `staff_profiles`, `activity_logs`.

Browser-facing grants are deliberately narrow:

| Table | anon | authenticated |
| --- | --- | --- |
| `services`, `courses`, `projects`, `project_images`, `products`, `staff_profiles` | `SELECT` (RLS limits rows) | `SELECT` (RLS limits rows) |
| `profiles` | none | `SELECT` own row; update `full_name`, `phone`, `avatar_url` |
| `user_roles` | none | `SELECT` own rows |
| `quote_requests`, `contact_messages`, `course_registrations`, `site_settings`, `activity_logs` | none | none |

Public policies expose only:

- published services,
- published courses,
- published projects where `is_sample = false`,
- images belonging to those projects,
- published products where `is_sample = false`,
- public staff profiles.

The service role bypasses RLS and is used only by the Express API.

### Verify RLS manually

Run as an anonymous user in the SQL editor:

```sql
set role anon;
select count(*) from public.services;          -- published only
select count(*) from public.quote_requests;    -- permission denied
reset role;
```

Then verify that a published sample project is still hidden:

```sql
select count(*) from public.projects where is_sample = true and published = true;
-- Public count above should remain 0 even if an admin publishes a sample.
```

## 8. Useful verification queries

```sql
-- Table and policy inventory
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Migration-created bucket
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'media';

-- Quote workflow values
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.quote_requests'::regclass;

-- Seed content counts
select 'services' as entity, count(*) from public.services
union all select 'courses', count(*) from public.courses
union all select 'projects', count(*) from public.projects
union all select 'products', count(*) from public.products
union all select 'published sample projects', count(*) from public.projects where is_sample and published;
```

## 9. Backup and recovery

- Enable Supabase point-in-time recovery on a paid plan for production.
- Take a manual logical backup before applying schema changes.
- Keep migration files under version control and never edit an already-applied migration in production; add a new migration instead.
- Test `supabase db reset` locally after changing migrations, then run the full test suite.

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| API returns `DATABASE_ERROR` for every data route | Wrong URL/key or migrations not applied | Check server logs, `/health`, and `supabase migration list` |
| Admin signs in but sees 403 | No `user_roles` row | Run the first-admin SQL |
| Password reset link goes to localhost | Supabase Site URL/redirect URLs not updated | Update Authentication → URL Configuration |
| Upload fails with 400 | File is not JPEG/PNG/WebP or exceeds 5 MB | Resize/convert the file |
| Upload fails with 502 | Storage bucket missing or secret key invalid | Run the storage migration and check `SUPABASE_SECRET_KEY` |
| Public project page 404 after publishing | Record is marked `is_sample = true` | Clear the sample flag after verifying the content is real |
| Seed re-run overwrites edits | It should not; `ON CONFLICT DO NOTHING` | Check for custom SQL outside the seed file |
