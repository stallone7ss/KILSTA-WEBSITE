# Security

## Security model

KILSTA treats the browser as untrusted. The trusted Express API holds the Supabase secret key and performs every write. PostgreSQL row-level security (RLS) provides a second layer so that even direct access with the publishable key cannot read submissions or settings.

### Controls in place

| Area | Control |
| --- | --- |
| Transport | HTTPS is provided by Render/Vercel/Supabase in production. |
| Headers | Helmet with `x-powered-by` disabled and cross-origin resource policy set to `cross-origin`. |
| CORS | Explicit allow-list; no wildcard; credentials enabled only for known origins. |
| Request size | JSON bodies limited to 100 KB; uploads limited to one 5 MB image. |
| Rate limits | 300 requests / 15 min per connection for `/api/v1`; 10 submissions / 10 min for public forms. |
| Authentication | Supabase access token verified with `auth.getUser(token)` on every protected request. |
| Authorisation | Roles reloaded from `public.user_roles`; route-level permission guards; UI guards are not security boundaries. |
| Input validation | Zod schemas for public and administrative bodies/queries; unknown object keys are stripped. |
| SQL access | No browser database client; PostgREST access limited to catalogue reads and own profile/roles. |
| RLS | Enabled on every application table; no public policies for submissions, settings or audit logs. |
| Grants | Browser roles have only the minimum table/column privileges. |
| Service key | Server-only; never included in `VITE_` variables or client bundles. |
| Uploads | Memory storage, MIME allow-list, extension derived server-side, random object path, 5 MB cap. |
| CSV | UTF-8 BOM, quoted fields, spreadsheet-formula prefix escaping. |
| Search | PostgREST filter metacharacters stripped and length capped. |
| Logging | JSON logs with redaction for email, phone, message, project description, notes, tokens, passwords and secrets. |
| Audit | Actor, action, entity and salted IP hash; no raw IP address and no submission body. |
| Errors | Known 4xx messages only; database errors are logged and replaced with safe messages. |
| Email | HTML values escaped; provider failures recorded as `failed`; disabled delivery recorded as `skipped`. |
| Secrets | `.env` files ignored; `.env.example` contains placeholders only. |

## Authentication and account lifecycle

- No public administrator registration route exists.
- Administrators create users in Supabase Auth, then insert a role row.
- A signed-in user with no `admin`/`staff` role is a visitor and is denied all `/admin` API routes.
- Removing a role takes effect on the next request because roles are loaded from the database each time.
- Disabling/deleting an Auth user invalidates sign-in; existing access tokens expire according to the Supabase JWT lifetime.
- Password recovery redirects only to URLs allowed in Supabase Auth settings.

### Reasonable operational rules

- Use unique accounts; do not share administrator credentials.
- Require MFA on the Supabase organisation and on email accounts that can reset passwords.
- Keep the administrator count small.
- Review the user list and audit log periodically.
- Remove roles promptly when someone leaves.
- Do not create accounts with the service-role key in the browser.

## RLS summary

Public (anon/authenticated) direct database access is limited to:

- published services and courses,
- published non-sample projects and their images,
- published non-sample products,
- public staff profiles,
- the signed-in user’s own profile and role rows.

No public policy exists for `quote_requests`, `contact_messages`, `course_registrations`, `site_settings` or `activity_logs`. The service role bypasses RLS, but it exists only on the server.

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for policies, grants and verification SQL.

## Permission matrix

| Capability | Visitor | Staff | Admin |
| --- | --- | --- | --- |
| Browse published content | yes | yes | yes |
| Submit quote/contact/registration | yes | yes | yes |
| View dashboard | no | yes | yes |
| View/update quotes | no | yes | yes |
| View/update contacts | no | yes | yes |
| View/update registrations | no | yes | yes |
| View catalogue | no | yes | yes |
| Create/edit catalogue | no | no | yes |
| Adjust stock | no | yes | yes |
| Manage staff profiles | no | no | yes |
| Manage site settings | no | no | yes |
| Manage users/roles | no | no | yes |
| Read/export audit log | no | no | yes |
| Export operational CSV | no | yes | yes |
| Upload media | no | no | yes |

## Public submission protections

- Schema validation for required fields, email/phone formats, lengths, consent and service category.
- Server-generated references; clients cannot choose a reference.
- Public dates restricted to today through two years ahead.
- Rate limiting per connection and a 100 KB body cap.
- Database constraints as a final check.
- Notification statuses are explicit; the UI does not state that an email was delivered.
- Duplicate spam control is limited to rate limiting. Add CAPTCHA or a WAF challenge if abuse appears.

## Upload security

- Only `image/jpeg`, `image/png` and `image/webp` are accepted.
- The server chooses the extension from the verified MIME type; the original filename is not used.
- Object paths are `purpose/uuid.ext`.
- The bucket is public for reads because images are embedded on the public website.
- No browser write policy exists. Uploads require `content:write`.
- 5 MB limit is enforced both by Multer and the bucket configuration.

If private documents are ever added, use a separate private bucket and signed URLs. Do not place private documents in `media`.

## Logging and privacy

- Sensitive keys are redacted recursively up to a shallow depth.
- Request logs contain method, path, status, duration and request ID; not request bodies or bearer tokens.
- Audit logs use `AUDIT_IP_SALT` to hash IPs. A missing salt falls back to an unsalted hash, which is weaker; set a long random value in production.
- Submission text and internal notes are not written to console logs.
- CSV exports are authenticated and audited. Audit-log export is admin-only.

Privacy and Terms pages describe the data collected. They are not a substitute for legal review. Have a qualified adviser review them for the jurisdictions you operate in.

## Known dependency advisories

At the time of this build, `npm audit` reported **13 advisories: 2 critical, 3 high, 8 moderate, 0 low**. The main affected packages:

| Package | Severity | Scope | Fix |
| --- | --- | --- | --- |
| `vitest` / `tinypool` / `@vitest/mocker` / `vite-node` | critical / moderate | Development and test tooling | `vitest@5` (breaking) |
| `vite` / `esbuild` | high / moderate | Development server and build tooling | `vite@8` (breaking) |
| `nodemailer` | high | Runtime email adapter | `nodemailer@10` (breaking) |
| `zod` | high | Runtime validation | `zod@4` (breaking) |
| `react-router-dom` | moderate | Runtime client routing | `react-router-dom@7` (breaking) |
| `tailwindcss` / `postcss-*` | moderate | Build tooling | `tailwindcss@4` (breaking) |

These were **not** force-upgraded because each requires a major-version migration and re-verification of runtime behaviour. `npm audit fix --force` should not be run in production without a planned upgrade and a full test pass.

Exposure notes:

- Vitest/Vite/esbuild/Tailwind advisories primarily affect development servers and test execution, not the built static client or the production Express runtime.
- Nodemailer is a runtime dependency. This deployment uses `EMAIL_PROVIDER=none` by default. If enabling SMTP/Resend, prioritise upgrading Nodemailer and review the advisory details for the exact API usage here (plain text/html messages, configured transport, no user-supplied transport options).
- Zod is used for bounded request bodies (100 KB), which limits oversized-collection attacks.
- React Router advisories concern client-side navigation; keep the package current as part of the next planned upgrade.

Recommended upgrade plan:

1. Create a branch and update one major at a time: Zod, React Router, Tailwind, Vitest/Vite, Nodemailer.
2. Run `npm run ci` after each upgrade.
3. Re-run the live integration suite.
4. Manually test sign-in, password recovery, forms, admin CRUD, CSV, uploads and responsive layout.
5. Deploy to staging before production.

## Hardening checklist before launch

- [ ] Set a long random `AUDIT_IP_SALT` in Render.
- [ ] Use a dedicated production Supabase project; do not reuse development data.
- [ ] Disable public sign-ups in Supabase Auth.
- [ ] Restrict Auth redirect URLs to production and explicit localhost URLs.
- [ ] Configure custom SMTP for password recovery.
- [ ] Set `FRONTEND_URL` to the exact production origin.
- [ ] Confirm no secret appears in the Vercel build output or repository.
- [ ] Enable Supabase backups/PITR.
- [ ] Enable MFA on Supabase, Render, Vercel and the notification mailbox.
- [ ] Configure log retention and alerting.
- [ ] Protect the production branch and require CI.
- [ ] Review privacy/terms with a legal adviser.
- [ ] Test the permission matrix with real staff and visitor accounts.
- [ ] Confirm sample projects/products are unpublished and marked `is_sample`.
- [ ] Run the post-deployment checklist in [DEPLOYMENT.md](DEPLOYMENT.md).

## Reporting a vulnerability

Do not open a public issue containing exploit details or credentials. Contact KILSTA directly at `kilsta2023@gmail.com` with a concise description, reproduction steps and impact. If credentials may have leaked, rotate them immediately in Supabase/Render/Vercel before further investigation.
