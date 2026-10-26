# Architecture

## Overview

KILSTA is a three-tier application. The browser never connects directly to PostgreSQL and never holds a service-role key.

```text
Browser (React SPA)
  │
  ├── Supabase Auth (publishable key, sign-in / recovery only)
  │
  └── HTTPS + Bearer access token
          │
          ▼
    Express API (trusted)
      ├── Zod validation
      ├── token verification via Supabase Auth
      ├── roles/permissions loaded from PostgreSQL
      ├── rate limits, CORS, Helmet, request IDs
      └── service-role Supabase client
          │
          ├── PostgreSQL (RLS enabled)
          ├── Supabase Storage (media bucket)
          └── Email provider (SMTP / Resend / none)
```

### Trust boundaries

| Boundary | Trusted? | Notes |
| --- | --- | --- |
| Browser | No | May send any payload. All input is revalidated. |
| Supabase JWT | Verified | The API calls `auth.getUser(token)`; it does not merely decode the token locally. |
| Roles in browser | Untrusted | UI guards are convenience only. The API reloads roles from `user_roles`. |
| Express API | Trusted | Holds the secret key and performs all writes. |
| Supabase service role | Trusted | Bypasses RLS by design; never shipped to the browser. |
| Database RLS | Defence in depth | Restricts direct anon/authenticated access even if a key leaks. |

## Monorepo

- Root scripts orchestrate both workspaces.
- `client` and `server` are npm workspaces with independent TypeScript and ESLint configurations.
- `supabase` holds SQL migrations, the local Supabase CLI configuration and seed data.
- `docs` contains operational and security documentation.

### Server structure

| Path | Responsibility |
| --- | --- |
| `src/index.ts` | HTTP listener, keep-alive settings, graceful shutdown |
| `src/app.ts` | Middleware stack and route mounting |
| `src/context.ts` | Dependency wiring; optional overrides for route-level tests |
| `src/config/env.ts` | Environment parsing and validation with Zod |
| `src/config/cors.ts` | Explicit origin allow-list |
| `src/config/permissions.ts` | Roles, permissions, status lists and transition maps |
| `src/middleware/auth.ts` | Bearer verification, staff guard, permission guard |
| `src/middleware/validate.ts` | Body/query/param validation |
| `src/services/content.service.ts` | Public catalogue and settings reads |
| `src/services/submission.service.ts` | Quote/contact/registration persistence and notifications |
| `src/services/admin.service.ts` | Administrative listing, updates, workflow transitions and audit |
| `src/services/email.service.ts` | SMTP/Resend adapters and template rendering |
| `src/controllers/` | HTTP request/response translation |
| `src/routes/` | `/api/v1` public and `/api/v1/admin` route tables |
| `src/utils/` | Errors, response envelopes, CSV, IP hashing, logging |

### Client structure

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Route table |
| `src/layouts/` | Public, auth and admin shells |
| `src/components/site/` | Header, footer, navigation, SEO helpers |
| `src/components/ui/` | Buttons, fields, dialogs, pagination, tables, badges, empty states |
| `src/components/admin/` | Permission guards, catalogue manager, form modal, admin tables |
| `src/contexts/` | Auth session, site settings, toast notifications |
| `src/hooks/` | Authenticated API fetching and permission helpers |
| `src/lib/api.ts` | Fetch wrapper, errors, bearer token injection, CSV download |
| `src/lib/validation.ts` | Client-side Zod schemas mirroring server rules |
| `src/services/` | Typed endpoint wrappers |
| `src/pages/` | Public, auth and admin pages |

## Routing

### Public routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/services` | Redirects to `/services/business` |
| `/services/business` | Business services |
| `/services/ict` | ICT services |
| `/training` | Training and courses |
| `/training/register` | Course registration |
| `/projects` | Projects/portfolio |
| `/projects/:slug` | Project detail |
| `/products` | Products |
| `/quote` | Request a quote |
| `/contact` | Contact |
| `/privacy`, `/terms` | Legal pages |
| `/error` | Error page |
| `/login`, `/forgot-password`, `/reset-password` | Authentication |
| `/admin/login` | Redirects to `/login` |
| any other path | 404 page |

### Admin routes

All admin routes are wrapped by `RequireStaff`. Individual pages additionally use `RequirePermission`; the API enforces the same permission independently.

| Route | Required permission |
| --- | --- |
| `/admin` | `dashboard:read` |
| `/admin/quotes` | `quotes:read` |
| `/admin/contacts` | `contacts:read` |
| `/admin/registrations` | `registrations:read` |
| `/admin/services` | `content:read` |
| `/admin/courses` | `content:read` |
| `/admin/projects` | `content:read` |
| `/admin/products` | `products:read` |
| `/admin/staff` | `content:read` |
| `/admin/settings` | `settings:write` |
| `/admin/users` | `users:manage` |
| `/admin/audit` | `audit:read` |

Staff users who lack a page permission do not see the navigation item; direct access renders a permission-denied state. API calls return `403` regardless of UI state.

## API

Base path: `/api/v1`. Every JSON response uses a consistent envelope.

Success:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 }
}
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the highlighted fields.",
    "details": []
  },
  "requestId": "..."
}
```

### Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness plus database check |
| `GET` | `/health/ready` | Readiness; `503` when the database is not configured or unavailable |
| `GET` | `/site` | Public company profile and homepage settings |
| `GET` | `/services` | Published services (`category`, `featured` filters) |
| `GET` | `/services/:slug` | Published service |
| `GET` | `/courses` | Published courses |
| `GET` | `/courses/:slug` | Published course |
| `GET` | `/projects` | Published non-sample projects |
| `GET` | `/projects/:slug` | Published non-sample project |
| `GET` | `/products` | Published non-sample products (`category`, `search`) |
| `GET` | `/products/:slug` | Published non-sample product |
| `GET` | `/staff` | Public staff profiles |
| `POST` | `/quotes` | Create a quote request |
| `POST` | `/contact` | Create a contact message |
| `POST` | `/course-registrations` | Create a course registration |

The three submission endpoints are limited to 10 requests per 10 minutes per connection. The whole `/api/v1` surface is limited to 300 requests per 15 minutes per connection. Rate limiting is disabled in the test environment.

### Administrative endpoints

All require `Authorization: Bearer <Supabase access token>` plus a staff or admin role.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/admin/me` | staff |
| `GET` | `/admin/dashboard` | `dashboard:read` |
| `GET` | `/admin/quotes` | `quotes:read` |
| `GET` | `/admin/quotes/:id` | `quotes:read` |
| `PATCH` | `/admin/quotes/:id` | `quotes:write` |
| `PATCH` | `/admin/quotes/:id/status` | `quotes:write` |
| `GET` | `/admin/contacts` | `contacts:read` |
| `PATCH` | `/admin/contacts/:id` | `contacts:write` |
| `GET` | `/admin/registrations` | `registrations:read` |
| `PATCH` | `/admin/registrations/:id` | `registrations:write` |
| `GET/POST/PATCH/DELETE` | `/admin/services` | `content:read` / `content:write` |
| `GET/POST/PATCH/DELETE` | `/admin/courses` | `content:read` / `content:write` |
| `GET/POST/PATCH/DELETE` | `/admin/projects` | `content:read` / `content:write` |
| `GET/POST/DELETE` | `/admin/projects/:projectId/images` | `content:read` / `content:write` |
| `GET` | `/admin/products` | `products:read` |
| `POST/PATCH/DELETE` | `/admin/products` | `products:write` |
| `PATCH` | `/admin/products/:id/stock` | `products:stock` |
| `GET/POST/PATCH/DELETE` | `/admin/staff-profiles` | `content:read` / `staff:write` |
| `GET` | `/admin/settings` | `settings:write` |
| `PUT` | `/admin/settings/:key` | `settings:write` |
| `GET` | `/admin/users` | `users:manage` |
| `PUT` | `/admin/users/:id/roles` | `users:manage` |
| `GET` | `/admin/activity-logs` | `audit:read` |
| `GET` | `/admin/exports/:entity` | `exports:read` (audit export: admin only) |
| `POST` | `/admin/uploads` | `content:write` |

List endpoints accept `page`, `pageSize`, `search`, `sort` and entity-specific filters. Pagination metadata is returned in `meta`.

## Permissions model

| Permission | Staff | Admin |
| --- | --- | --- |
| `dashboard:read` | yes | yes |
| `quotes:read`, `quotes:write` | yes | yes |
| `contacts:read`, `contacts:write` | yes | yes |
| `registrations:read`, `registrations:write` | yes | yes |
| `content:read` | yes | yes |
| `content:write` | no | yes |
| `products:read`, `products:stock` | yes | yes |
| `products:write` | no | yes |
| `staff:write` | no | yes |
| `settings:write` | no | yes |
| `users:manage` | no | yes |
| `audit:read` | no | yes |
| `exports:read` | yes | yes |

A user with no admin/staff role is treated as a visitor and is denied every `/admin` endpoint.

## Workflow rules

Quote statuses and transitions are defined once in `server/src/config/permissions.ts` and enforced by `admin.service.ts`:

```text
New ──────────► Under Review ──► Quoted ──► Accepted ──► In Progress ──► Completed
 │                    │              │           │             │
 └────► Rejected ◄────┴──────────────┴───────────┴─────────────┘
             │
             └──► Under Review
```

`Completed` is terminal. Same-status updates are accepted as no-ops.

Course registrations:

```text
Pending ──► Confirmed ──► Completed
   ▲            │
   │            ▼
   └─────── Cancelled
```

`Completed` is terminal.

Contacts use `New`, `In Progress` and `Resolved`.

Every administrative mutation writes an `activity_logs` row with actor identity, action, entity, a metadata summary and a salted IP hash. Sensitive submission text is not copied into logs.

## Authentication flow

1. The client signs in with Supabase Auth using the publishable key.
2. Supabase returns an access token and refresh token; the Supabase JS client refreshes the session.
3. The client sends the access token as `Authorization: Bearer …` to the Express API.
4. `authenticate` calls `auth.getUser(token)` to verify the token with Supabase Auth.
5. The API queries `user_roles` for that user ID and computes permissions server-side.
6. Route-level `requirePermission` guards reject unauthorised operations.
7. On password recovery, Supabase redirects to the configured `/reset-password` URL; the client exchanges the recovery session and calls `updateUser({ password })`.

There is no public administrator sign-up. Accounts are created by an administrator in the Supabase dashboard or via the Supabase Admin API.

## Data flow examples

### Quote submission

```text
Quote form
  → client validation
  → POST /api/v1/quotes
  → Zod server validation + consent check
  → generate unique reference (e.g. KQ-20261026-XXXXXXXX)
  → insert quote_requests with service role
  → render customer and business emails
  → attempt notification through configured provider
  → record sent/failed/skipped statuses
  → return reference + submittedAt + notification statuses
  → client shows confirmation without claiming email delivery
```

### Admin status change

```text
Admin UI
  → PATCH /api/v1/admin/quotes/:id/status
  → bearer verification + roles from DB
  → quotes:write check
  → load current quote
  → reject transition not present in transition map
  → update row with service role
  → insert activity_logs row
  → return updated record
```

## Design system

- Fonts: Sora for headings, Inter for body text.
- Palette: deep navy, white, teal and gold accents.
- Components are hand-built Tailwind primitives; there is no component library theme to override.
- Artwork is custom SVG/CSS; there are no stock photographs.
- Accessibility: labelled fields, keyboard-accessible dialogs, visible focus states, semantic headings and skip links.
- SEO: per-page title/description helpers, canonical metadata from `VITE_SITE_URL`, and no fabricated structured data.

## Extension points

- Add a catalogue entity by extending the database migration, `content.service`, `catalog.controller`, admin routes and `CatalogManagerPage` configuration.
- Add a permission in `config/permissions.ts`, then guard the route and the client navigation item.
- Add an email provider by implementing the provider interface in `email.service.ts` and extending the environment enum.
- Add a status workflow by updating the database check constraint, the transition map and the admin UI options.
