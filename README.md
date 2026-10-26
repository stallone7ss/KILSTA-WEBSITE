# KILSTA Business & ICT Consultants

Production-oriented website and administration system for **KILSTA Business & ICT Consultants**, Gumini Village, Huhu LLG, Alotau District, Milne Bay Province, Papua New Guinea.

The repository is an npm-workspaces monorepo:

| Workspace | Technology | Purpose |
| --- | --- | --- |
| `client` | React 18, TypeScript, Vite, Tailwind CSS | Public website, quote/contact/training forms, staff administration UI |
| `server` | Node.js, Express 4, TypeScript, Zod | Public API, authenticated administration API, validation, rate limiting, email adapters |
| `supabase` | PostgreSQL, Auth, Storage, RLS migrations | Database schema, row-level security, grants, public media bucket, seed content |

## What is included

### Public site

- Home, About, Business Services, ICT Services, Training, Course Registration, Projects/Portfolio, Products, Quote, Contact, Privacy, Terms, Login, Forgot Password, Reset Password, 404 and error pages.
- Quote requests with a server-generated unique reference, preferred contact method, optional budget/completion date and explicit consent.
- Course registration and general contact submissions through the trusted API.
- Product prices shown as “Price on request” when no price is recorded.
- Honest empty states for projects, products and staff that have not been published. Seeded sample projects/products are marked `is_sample` and are never shown publicly.
- Responsive navy/white design with teal and gold accents, custom SVG artwork and no stock photography.

### Administration

- `/admin` dashboard and protected pages for quotes, contacts, registrations, services, courses, projects, products/stock, staff profiles, site settings, users/roles and the audit log.
- Seven quote statuses with enforced transitions, internal notes, assignment and CSV export.
- Registration status workflow, contact status workflow, stock adjustments and project image management.
- Server-side role and permission checks on every protected request; no public admin self-registration.
- Audit records for administrative changes, with hashed IP addresses.

### Security and reliability

- Supabase Auth access tokens verified server-side on every protected request.
- Roles loaded from `public.user_roles` in the database, never trusted from token claims or browser input.
- RLS enabled on every application table. Browser roles can read only published catalogue content and their own profile/roles.
- The Supabase secret/service-role key is server-only. Only publishable values are present in the browser build.
- Helmet security headers, restricted CORS allow-list, request size limits, rate limits, request IDs and safe JSON errors.
- Zod validation on public and administrative input; spreadsheet-formula escaping for CSV exports.
- Email adapters for SMTP, Resend, or explicit `none`. `none` records notification status as `skipped`; it does not pretend an email was delivered.

## Repository layout

```text
.
├── client/
│   ├── src/
│   │   ├── components/        # site chrome, UI primitives, admin components
│   │   ├── contexts/          # auth, settings, toast
│   │   ├── hooks/             # API and permission hooks
│   │   ├── layouts/           # public, auth and admin layouts
│   │   ├── lib/               # API client, Supabase client, formatting, validation
│   │   ├── pages/             # public and admin pages
│   │   ├── services/          # typed API wrappers
│   │   ├── test/              # Vitest setup
│   │   └── types/             # client domain types
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/            # env, CORS, permissions, Supabase clients
│   │   ├── controllers/       # public, admin and catalogue handlers
│   │   ├── middleware/        # auth, validation, rate limits, logging
│   │   ├── routes/            # /api/v1 public and /api/v1/admin routes
│   │   ├── services/          # content, submissions, admin, auth, email
│   │   ├── utils/             # errors, HTTP responses, CSV, logger
│   │   └── validators/        # Zod schemas
│   └── tests/                 # unit and route-level tests
├── supabase/
│   ├── migrations/            # schema, RLS, grants, storage
│   ├── seed.sql               # published services/courses and hidden samples
│   └── config.toml
├── docs/
├── .github/workflows/ci.yml
└── vercel.json
```

## Prerequisites

- Node.js 20 or newer (local verification used Node 24; CI uses Node 20).
- npm 10 or newer.
- A Supabase project (PostgreSQL 15, Auth, Storage) for real data.
- Optional: Supabase CLI and Docker for local database testing.
- Optional: an SMTP or Resend account for transactional email.

## Local setup

1. Install dependencies from the repository root:

   ```bash
   npm ci
   ```

2. Create environment files:

   ```bash
   copy server\.env.example server\.env
   copy client\.env.example client\.env.local
   ```

   On macOS/Linux use `cp` instead of `copy`.

3. Fill in `server/.env` with the Supabase project URL, publishable key and secret key. Fill in `client/.env.local` with the same URL, the publishable key, the API base URL and the site URL. Never place the secret key in `client/.env.local`.

4. Apply the database migrations using one of the options in [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md).

5. Start both applications:

   ```bash
   npm run dev
   ```

   - Client: http://localhost:5173
   - API: http://localhost:3000
   - Liveness: http://localhost:3000/health
   - Readiness: http://localhost:3000/health/ready

## Verification

```bash
npm run lint        # ESLint for server and client
npm run typecheck   # TypeScript for server (app + tests) and client
npm test            # Vitest server and client suites
npm run build       # server tsc build + client production build
npm run ci          # lint + typecheck + test + build
```

Current results in this workspace:

- Clean `npm ci`: passes and reproduces the lockfile.
- `npm run lint`: 0 errors, 7 `react-refresh/only-export-components` warnings.
- `npm run typecheck`: server and client pass.
- Server tests: 5 files, 57 passing.
- Client tests: 3 files, 20 passing.
- `npm run build`: server and client production builds pass.
- `npm run ci`: passes end to end after a clean install.
- Live Supabase integration suite: skipped by default; requires project credentials and `RUN_INTEGRATION=1`.

See [docs/TESTING.md](docs/TESTING.md) for coverage detail and the live RLS test procedure.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database and Supabase setup](docs/DATABASE_SETUP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [Administration guide](docs/ADMIN_GUIDE.md)
- [Testing](docs/TESTING.md)

## Company details used by the site

- Gumini Village, Huhu LLG, Alotau District, Milne Bay Province, Papua New Guinea
- P.O. Box 424, Alotau
- +675 82545274
- kilsta2023@gmail.com
- Registration 6-129295384
- TIN 502603269

These values are centralised in `client/src/lib/company.ts` and the seeded `company_profile` site setting.

## Deployment target

The public client is configured for GitHub Pages at:

```text
https://stallone7ss.github.io/KILSTA-WEBSITE/
```

`.github/workflows/pages.yml` builds the Vite client with the `/KILSTA-WEBSITE/` base path and deploys it on pushes to `main`. The repository's Pages source must be set to **GitHub Actions**, and the Actions secrets `VITE_API_BASE_URL`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be configured for a functional deployment.

GitHub Pages hosts static files only. The Express API and Supabase project must be deployed separately; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Status and limitations

- The GitHub Pages workflow and Vite base-path support are configured, but the live deployment has not been verified from this workspace.
- No production Supabase, Render, Vercel or email credentials are included in this repository. Deployment, live authentication, RLS execution and email delivery have therefore **not** been verified against real infrastructure.
- The hosted CI workflow has not been executed. Local equivalents have been executed; exact local results are recorded above.
- `npm audit` reports dependency advisories, including some that require breaking framework upgrades. See [docs/SECURITY.md](docs/SECURITY.md) for the current audit position.
