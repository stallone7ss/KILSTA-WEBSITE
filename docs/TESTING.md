# Testing

## Test stack

- **Vitest** for server and client unit/integration-style tests.
- **Supertest** for Express route tests.
- **Testing Library** with jsdom for React primitive tests.
- **Fake database builders** for route tests, so the default suite needs no network or Supabase credentials.
- **Optional live Supabase suite** for RLS/grant verification against a real project.

## Commands

From the repository root:

```bash
npm run lint        # server + client ESLint
npm run typecheck   # server app/tests + client TypeScript
npm test            # server suite then client suite
npm run test:server
npm run test:client
npm run build       # production builds
npm run ci          # lint + typecheck + test + build
```

Watch modes:

```bash
npm --workspace server run test
npm --workspace client run test
```

Live Supabase RLS suite:

```powershell
$env:RUN_INTEGRATION="1"
$env:SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY="YOUR_PUBLISHABLE_KEY"
$env:SUPABASE_SECRET_KEY="YOUR_SECRET_KEY"
npm --workspace server run test:integration
```

In bash:

```bash
RUN_INTEGRATION=1 \
SUPABASE_URL=... \
SUPABASE_PUBLISHABLE_KEY=... \
SUPABASE_SECRET_KEY=... \
npm --workspace server run test:integration
```

Without `RUN_INTEGRATION=1` and all three variables, the five live checks are reported as **skipped**, and the command exits successfully.

## Default suite coverage

### Server — 5 files, 57 tests

| File | Tests | What it verifies |
| --- | --- | --- |
| `server/tests/permissions.test.ts` | 12 | Role permission matrix; quote and registration transition rules; admin override; unknown roles; terminal states; no-op transitions |
| `server/tests/validators.test.ts` | 14 | Quote/contact/registration schemas; consent; date bounds; invalid calendar dates; honeypot; email normalisation; admin query coercion; status enum |
| `server/tests/submissions.test.ts` | 6 | Quote persistence with server reference; skipped/failed/sent notification semantics; unique references; contact workflow; unpublished-course rejection; registration persistence |
| `server/tests/admin-workflow.test.ts` | 7 | Allowed quote transition plus audit; illegal jump rejection with no writes; notes-only update; no-op; 404; registration confirmation; unconfirmed completion rejection |
| `server/tests/api.test.ts` | 18 | Public settings shape; quote creation; invalid input; honeypot; malformed JSON; 100 KB body limit; JSON 404; Helmet headers; CORS allow/deny; health/readiness; missing/invalid token; DB-loaded roles; staff permissions; admin permissions; status validation |

The route tests inject fake content/submission/admin services through `server/src/context.ts`. They verify HTTP behaviour, auth, authorisation, validation and error envelopes without touching a real database.

### Client — 3 files, 20 tests

| File | Tests | What it verifies |
| --- | --- | --- |
| `client/src/lib/validation.test.ts` | 10 | Quote, contact, registration and auth form schemas; consent; date bounds; honeypot; password rules |
| `client/src/lib/format.test.ts` | 7 | Unknown price handling; date degradation; humanisation; status tones; every workflow status present; terminal states |
| `client/src/components/ui/primitives.test.tsx` | 3 | Accessible rendering of shared UI primitives |

## Latest recorded local results

Executed on Windows with Node 24.18.0 and npm 11.16.0:

| Command | Result |
| --- | --- |
| `npm ci` | Pass: 488 packages installed, lockfile reproduced |
| `npm run lint` | Pass: 0 errors, 7 `react-refresh/only-export-components` warnings |
| `npm run typecheck` | Pass: server and client |
| `npm --workspace server run test:run` | Pass: 5 files, 57 tests |
| `npm --workspace client run test:run` | Pass: 3 files, 20 tests |
| `npm --workspace server run test:integration` | Pass with 5 skipped (no credentials) |
| `npm run build` | Pass: server and client production builds |
| `npm run ci` | Pass end to end after the clean install |

These are local results only. The GitHub Actions workflow has not run on a remote runner from this workspace.

## What is not covered automatically

- Real Supabase database queries and RLS (covered by the optional live suite, not the default suite).
- Real Supabase Auth sign-in, token refresh and password recovery.
- SMTP/Resend delivery and inbox placement.
- Browser end-to-end flows (Playwright/Cypress is not configured).
- Visual regression, accessibility audits and cross-browser testing.
- Render/Vercel deployment, custom domains and TLS.
- File upload to real Supabase Storage (the route tests inject a fake database).
- Load/performance testing.
- CSV rendering in Excel/Sheets.

Do not describe the application as “fully tested” against production infrastructure. Use the manual checklist below in staging.

## Live RLS suite

File: `server/tests/integration/supabase-rls.test.ts`

It verifies:

1. The anon role reads only published services.
2. The anon role cannot select quote submissions.
3. The anon role cannot insert quote submissions.
4. The service role can read submissions.
5. The `media` bucket exists and is public-read.

Recommended procedure:

1. Use a dedicated staging Supabase project, never production.
2. Apply migrations and seed.
3. Set the environment variables above.
4. Run the live suite.
5. Confirm all 5 tests execute (not skip).
6. Delete/reset the staging project afterward if test data was created.

The suite does not test anonymous Storage uploads. Verify that separately in the dashboard or with a small script; there should be no anon insert policy on `storage.objects` for `media`.

## CI

`.github/workflows/ci.yml` contains two jobs.

### `quality`

On Ubuntu with Node 20:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`
6. Uploads nothing by default; logs are the artifact.

### `database`

On Ubuntu with the Supabase CLI:

1. Install the CLI.
2. `supabase start`
3. `supabase db reset` — applies migrations and seed.
4. Query the database to confirm tables, the `media` bucket and published seed content.
5. Stop the stack.

This job does not need project secrets. It validates that migrations apply cleanly from scratch.

If the Supabase CLI version changes output or Docker startup timing, adjust the wait/health step. The database job is intentionally separate so a migration failure is obvious.

## Manual test plan before launch

### Public pages

- [ ] Home, About, Business Services, ICT Services, Training, Projects, Products, Quote, Contact, Privacy, Terms.
- [ ] Header/footer links and mobile navigation.
- [ ] Direct deep links work after refresh (SPA rewrite).
- [ ] 404 page for unknown routes.
- [ ] Empty catalogue states do not claim clients/projects that do not exist.
- [ ] Unknown prices show “Price on request”, not “Free” or “$0”.

### Forms

- [ ] Valid quote creates a record and returns a unique reference.
- [ ] Optional organisation/budget/date behave correctly.
- [ ] Consent is required.
- [ ] Past and >2-year completion dates are rejected.
- [ ] Invalid email/phone and short descriptions show field errors.
- [ ] Honeypot submissions are rejected without revealing the reason.
- [ ] Contact form succeeds.
- [ ] Course registration lists only published courses and succeeds.
- [ ] Double-submit is prevented or idempotency is understood.
- [ ] Notification status is displayed honestly; `skipped` is not shown as delivered.
- [ ] Server validation still rejects tampered requests.

### Auth

- [ ] Admin can sign in.
- [ ] Wrong password shows a safe error.
- [ ] Forgot password sends a recovery link to the correct domain.
- [ ] Recovery link opens `/reset-password` and updates the password.
- [ ] Signed-out deep link to `/admin` redirects to login.
- [ ] Visitor account is denied `/admin`.
- [ ] Expired/invalid token produces 401 and a clean re-login flow.

### Admin

- [ ] Dashboard figures match the database.
- [ ] Quote search/filter/sort/pagination.
- [ ] Quote drawer opens, notes save, only valid status transitions appear.
- [ ] Illegal transition is rejected (test with API client).
- [ ] Contact status and notes.
- [ ] Registration confirm/complete/cancel and notes.
- [ ] Create/edit/unpublish a service, course, project, product.
- [ ] Sample project/product stays hidden publicly.
- [ ] Stock update and low-stock indicator.
- [ ] Staff profile create/edit/public toggle.
- [ ] Project image upload, URL add, alt text, delete.
- [ ] Settings company/homepage updates appear on the public site.
- [ ] Users/roles update; self-demotion blocked; last admin protected.
- [ ] Staff cannot access settings/users/content writes/audit.
- [ ] CSV exports download, open, and respect filters.
- [ ] Audit log records create/update/delete/export actions.

### Security

- [ ] Untrusted Origin receives no permissive CORS header.
- [ ] Unauthenticated `/api/v1/admin/*` is 401.
- [ ] Authenticated visitor is 403.
- [ ] Security headers present.
- [ ] Request body >100 KB is rejected.
- [ ] Submission rate limit returns 429 after 10 in 10 minutes.
- [ ] Oversized/invalid upload rejected.
- [ ] No secret key in client bundle.
- [ ] `/health` exposes no credentials.
- [ ] Password recovery URL cannot be redirected to an untrusted domain.

### Deployment

- [ ] Render health check passes at `/health/ready`.
- [ ] Vercel environment values are present at build time.
- [ ] `VITE_API_BASE_URL` includes `/api/v1`.
- [ ] Production CORS allows the client and denies others.
- [ ] Deep links and password recovery work on the final domain.
- [ ] Sample data and test submissions removed or clearly marked.

## Adding tests

### Route test pattern

1. Build a fake context with the specific service override:

```ts
import { createApp } from '../src/app';
import { testConfig } from './helpers';

const app = createApp({
  config: testConfig,
  auth: fakeAuth,
  admin: fakeAdmin,
  enableRateLimits: false
});
```

2. Use Supertest to call the endpoint.
3. Assert the envelope, status code and side effects.
4. Never use real credentials in unit tests.

### Unit test pattern

Import the pure function (validation schema, transition map, formatter) and test boundaries and failure modes. Avoid snapshot tests for security-relevant behaviour.

### Integration test pattern

Use a dedicated staging Supabase project. Gate with `RUN_INTEGRATION=1` and credentials. Clean up created rows or reset the project afterward.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `vitest` cannot find jsdom | Dependency hoisting/install issue | `npm ci` from the root; `jsdom` is a root devDependency |
| Client tests fail to resolve testing-library | Missing install | Re-run `npm ci` at the root |
| Server route tests need Supabase | A real client was constructed | Inject fakes through `createApp`/`context` |
| Integration suite shows 5 skipped | `RUN_INTEGRATION` or credentials missing | Set all four values |
| CI database job times out | Docker/Supabase startup slow | Increase wait/retry; check CLI output |
| Build chunk warning | Large client bundle | Manual chunks are configured; check the actual sizes in build output |
