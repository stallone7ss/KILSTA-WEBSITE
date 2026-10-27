# Deployment

Recommended topology:

- **Database/Auth/Storage:** Supabase-hosted project
- **API:** Render web service running the Express server
- **Client:** GitHub Pages project site (`stallone7ss/KILSTA-WEBSITE`) or Vercel static deployment

The client and API are separate origins, so the API CORS allow-list must include the exact client origin (and any explicitly trusted preview origins). For the GitHub Pages site the browser origin is `https://stallone7ss.github.io`, not the `/KILSTA-WEBSITE/` path.

> The static client has been deployed to GitHub Pages and the public shell is verified. No Supabase project, API service or email provider has been deployed, so the backend steps below remain an unexecuted production procedure.

> GitHub Pages hosts static files only. The Express API cannot run there. Forms, authentication, catalogue data and the admin dashboard only work after the API and Supabase project are deployed and the Pages build is given their URLs.

## 1. Prepare the Supabase project

Follow [DATABASE_SETUP.md](DATABASE_SETUP.md):

1. Create the production project.
2. Push the migrations.
3. Run `supabase/seed.sql` if this is a new deployment.
4. Configure Auth Site URL and redirect URLs with the final Vercel domain.
5. Configure recovery SMTP.
6. Create the first administrator and insert the `admin` role.

Record:

- Project URL
- Publishable key
- Secret key (server only)
- Database password (backup only)

## 2. Deploy the API to Render

The repository includes `render.yaml`, so the fastest path is **Render Dashboard → New → Blueprint → connect `stallone7ss/KILSTA-WEBSITE`**. The blueprint creates one free Node web service named `kilsta-api` with the Supabase URL, publishable key, GitHub Pages origin and a generated audit salt already set. You are prompted for `SUPABASE_SECRET_KEY`, which is the only value the blueprint does not store in Git.

Alternatively, create a **Web Service** manually from the repository.

| Setting | Value |
| --- | --- |
| Environment | Node |
| Root Directory | repository root |
| Build Command | `npm ci --include=dev && npm run build:server` |
| Start Command | `npm --workspace server run start` |
| Health Check Path | `/health/ready` |
| Auto-Deploy | On commit to the production branch |
| Instance Type | Starter or higher; free instances sleep and delay first requests |

Node 20 is the supported baseline (`engines.node >= 20`). If Render selects a newer Node version, keep it at 20 or 22 after verifying the build.

### API environment variables

Set these in **Render → Environment**:

```ini
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://YOUR-CLIENT-DOMAIN
ADDITIONAL_ALLOWED_ORIGINS=
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=YOUR_SECRET_KEY
EMAIL_PROVIDER=none
EMAIL_FROM=KILSTA Business & ICT Consultants <no-reply@YOUR-DOMAIN>
ADMIN_NOTIFICATION_EMAIL=kilsta2023@gmail.com
LOG_LEVEL=info
TRUST_PROXY=1
AUDIT_IP_SALT=A_LONG_RANDOM_VALUE
```

Notes:

- Render injects its own `PORT`; the server reads `process.env.PORT`. Setting `10000` is usually safe, but do not hard-code it in code.
- `FRONTEND_URL` must be the exact browser origin, without a trailing slash. Do not use `*`.
- Preview deployments have different URLs. Add only domains you genuinely trust to `ADDITIONAL_ALLOWED_ORIGINS`, comma-separated.
- `AUDIT_IP_SALT` should be a long random secret. It salts IP hashes in the audit log; changing it makes old and new hashes non-comparable.
- `SUPABASE_SECRET_KEY` must never be exposed to Vercel or the browser.
- `TRUST_PROXY=1` matches a single Render proxy hop. Increase only if you add another trusted proxy.

### Email configuration

`EMAIL_PROVIDER=none` is the honest default. Submissions are stored, and notification statuses are recorded as `skipped`. The UI must not claim that email was delivered.

To enable delivery, choose one:

**Resend**

```ini
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_YOUR_KEY
EMAIL_FROM=KILSTA Business & ICT Consultants <no-reply@YOUR_VERIFIED_DOMAIN>
ADMIN_NOTIFICATION_EMAIL=kilsta2023@gmail.com
```

The sending domain/address must be verified in Resend.

**SMTP**

```ini
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=KILSTA Business & ICT Consultants <no-reply@YOUR_DOMAIN>
ADMIN_NOTIFICATION_EMAIL=kilsta2023@gmail.com
```

After deployment, submit a test quote and verify the `customer_notification_status` and `business_notification_status` in the admin UI or database. Only `sent` means the provider accepted the message. This does not prove inbox delivery.

## 3. Deploy the client to Vercel

The root `vercel.json` configures:

- Install: `npm ci`
- Build: `npm run build:client`
- Output: `client/dist`
- SPA rewrite to `/index.html`

Create a Vercel project from the repository root. If Vercel asks for a framework, choose **Vite**; the config file supplies the rest.

### Client environment variables

Set these for Production (and separately for Preview if needed):

```ini
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_SITE_URL=https://YOUR-CLIENT-DOMAIN
```

Important:

- `VITE_API_BASE_URL` must include `/api/v1`.
- If it is omitted, the client falls back to `/api/v1` on the same origin. That only works if you add a proxy/rewrite to the API. On a plain Vercel deployment, set the Render URL explicitly.
- Every `VITE_` value is embedded in the browser bundle. Never add the Supabase secret key or any email API key.
- `VITE_SITE_URL` is used for canonical URLs and site metadata.
- Rebuild after changing any environment variable; Vite values are baked in at build time.

### Custom domain and Auth redirects

1. Add the production domain in Vercel.
2. Set the Supabase **Site URL** to `https://YOUR-CLIENT-DOMAIN`.
3. Add `https://YOUR-CLIENT-DOMAIN/reset-password` to the Supabase redirect allow-list.
4. Update the Render `FRONTEND_URL` to the same origin.
5. Redeploy the API if CORS settings changed.
6. Test sign-in and password recovery from the production domain.

## 3A. Deploy the client to GitHub Pages

The repository `stallone7ss/KILSTA-WEBSITE` publishes a project site at:

```text
https://stallone7ss.github.io/KILSTA-WEBSITE/
```

That URL is a sub-path, so the client must be built with `VITE_BASE_PATH=/KILSTA-WEBSITE/`. `.github/workflows/pages.yml` does this and copies `index.html` to `404.html` so client-side routes survive direct visits and refreshes.

### Required repository settings

1. Open **GitHub → stallone7ss/KILSTA-WEBSITE → Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Add repository secrets under **Settings → Secrets and variables → Actions**:
   - `VITE_API_BASE_URL` — `https://YOUR-RENDER-SERVICE.onrender.com/api/v1`
   - `VITE_SUPABASE_URL` — `https://YOUR_PROJECT_REF.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — the publishable key
4. Push to `main` or run **Deploy client to GitHub Pages** manually from the Actions tab.

The workflow sets:

```ini
VITE_BASE_PATH=/KILSTA-WEBSITE/
VITE_SITE_URL=https://stallone7ss.github.io/KILSTA-WEBSITE
```

`VITE_SITE_URL` is baked into canonical metadata. `client/public/robots.txt` and `client/public/sitemap.xml` are also written for this URL; update both if the repository or custom domain changes.

### Connect the backend

- Render `FRONTEND_URL=https://stallone7ss.github.io` (origin only, no `/KILSTA-WEBSITE` suffix).
- Do **not** add a path to the CORS allow-list; browsers send only the origin.
- In Supabase Auth, set **Site URL** to `https://stallone7ss.github.io/KILSTA-WEBSITE` and add `https://stallone7ss.github.io/KILSTA-WEBSITE/reset-password` to the redirect allow-list.
- If the Actions secrets are absent, the client builds with no Supabase configuration and a relative `/api/v1` base. The page loads, but authentication and all dynamic data fail. This is not a working deployment.

### Vercel and GitHub Pages together

Both can use the same repository. `vercel.json` still builds the client at the root for Vercel. The Pages workflow is independent. If you use both, set each platform's environment variables and add both origins to `ADDITIONAL_ALLOWED_ORIGINS` on the API.

## 4. Post-deployment checks

Run these in order:

```bash
# API liveness
curl -i https://YOUR-API/health

# Readiness; must be 200 with database ok
curl -i https://YOUR-API/health/ready

# Public content
curl -i https://YOUR-API/api/v1/site
curl -i https://YOUR-API/api/v1/services
```

Then verify in the browser:

1. All public routes load directly (deep links do not 404).
2. A quote request returns a unique reference and appears in the admin dashboard.
3. A contact message and course registration appear in the admin dashboard.
4. Verification is not claimed in the UI unless email actually sent.
5. Sign-in works for the administrator.
6. A staff account can see quotes/contacts/registrations but cannot open settings or users.
7. A visitor account (signed in without a role) is denied `/admin` and receives `403` from the API.
8. Password recovery sends a link to `/reset-password` on the production domain.
9. Publishing a test service makes it appear publicly; unpublishing hides it.
10. A sample project/product remains hidden even if published, until `is_sample` is cleared.
11. Uploading a valid JPEG/PNG/WebP produces a URL; an invalid type or oversized file is rejected.
12. CSV exports download and open correctly.

### Security spot checks

```bash
# CORS should not echo an untrusted Origin
curl -i -H "Origin: https://evil.example" https://YOUR-API/api/v1/site

# Unauthenticated admin request must be 401
curl -i https://YOUR-API/api/v1/admin/dashboard

# Security headers should include helmet defaults
curl -I https://YOUR-API/health
```

Also confirm:

- The client bundle contains no secret key. Search the built assets for `service_role` and the secret value.
- `/health` does not expose credentials.
- An invalid bearer token returns `401`.
- An authenticated user with no role receives `403`.

## 5. CI/CD

`.github/workflows/ci.yml` runs on pull requests and pushes:

- quality job: `npm ci`, lint, typecheck, unit/route tests, production builds
- database job: starts the Supabase CLI stack, applies migrations and seed with `supabase db reset`

`.github/workflows/pages.yml` builds the client with the `/KILSTA-WEBSITE/` base path and deploys it to GitHub Pages on pushes to `main`. It requires the repository Pages source to be set to **GitHub Actions** and the three client build secrets described above.

The Vercel and Render projects can auto-deploy from the same branch after CI passes. If you require CI gating, enable the platform’s “wait for CI” or protect the production branch.

The live RLS integration suite is **not** run by default in CI because it needs a real Supabase project and credentials. Run it manually as described in [TESTING.md](TESTING.md).

## 6. Rollback

- **Client:** promote a previous Vercel deployment, or re-run the GitHub Pages workflow from a known-good commit.
- **API:** roll back to a previous Render deploy.
- **Database:** migrations are forward-only. Restore from backup/PITR if a bad migration must be undone, or write a new compensating migration. Do not edit an applied migration.
- **Environment:** keep previous environment values in a secret manager so CORS/Auth changes can be reverted.

## 7. Operational notes

- Free Render instances sleep; health checks may fail during cold starts. Use a paid instance for reliable availability.
- Supabase free projects may pause. Monitor `/health/ready`.
- Configure Supabase backups/PITR before collecting real submissions.
- Set log retention and alerting at Render.
- Review `npm audit` before each production release. Do not run `npm audit fix --force` without testing major upgrades.
- Rotate the Supabase secret key and email API key if they are ever exposed. Rotating the secret key requires updating the Render environment and redeploying.

## 8. What is still required before a live launch

The code is complete enough to deploy, but the following external actions have not been performed:

- Create the real Supabase project and apply migrations.
- Configure production SMTP/Resend and verify a sending domain.
- Create the first administrator and any staff accounts.
- Deploy the API to Render and the client to GitHub Pages or Vercel.
- Set production domains, CORS and Auth redirect URLs. For GitHub Pages, the API CORS origin is `https://stallone7ss.github.io` and the Supabase redirect is `https://stallone7ss.github.io/KILSTA-WEBSITE/reset-password`.
- Run the post-deployment checklist above.
