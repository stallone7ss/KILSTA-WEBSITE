# Administration Guide

This guide is for KILSTA staff and administrators using `/admin`.

## 1. Signing in

1. Go to `https://YOUR-DOMAIN/login`.
2. Enter the email and password created by an administrator.
3. After sign-in, you are redirected to `/admin`.

Visitors cannot register themselves. If you need access, ask an existing administrator to create your account and assign a role.

### Password recovery

Use **Forgot password** on the login page. Supabase sends a recovery link to the configured `/reset-password` page. The link expires according to your Supabase Auth settings.

If recovery email does not arrive, ask an administrator to check the Supabase SMTP configuration. Application notification email settings do not affect password recovery.

## 2. Roles

| Role | Can do |
| --- | --- |
| **Admin** | Everything: operational records, catalogue content, staff profiles, settings, users/roles, audit log, exports, uploads |
| **Staff** | Dashboard, quotes, contacts, registrations, catalogue reading, stock updates, operational CSV exports |
| **Visitor** | Public website only; no admin access |

Staff cannot create or delete catalogue records, edit content, manage staff profiles, change settings, manage users or read the audit log.

Permissions are enforced by the API. Hiding a menu item is only a convenience.

### Managing users

Administrators can open **Users & roles**, search users, and select roles.

- A user must already exist in Supabase Auth. This screen does not create Auth accounts.
- You cannot remove your own administrator role.
- The system prevents removal of the last administrator.
- Role changes take effect on the user’s next API request.
- Removing all roles makes the user a visitor.

To create a new staff account, follow [DATABASE_SETUP.md](DATABASE_SETUP.md) and assign `staff`.

## 3. Dashboard

The dashboard shows:

- New quote requests, with total and unassigned counts.
- Quotes under review.
- New contact messages.
- Pending training registrations.
- Recent quote requests and contact messages.
- Quote pipeline counts by status.
- Published services, courses, projects and products.
- Products at or below their low-stock threshold.
- A reminder that sample project/product records are hidden publicly.

All figures come from the database. Empty states are shown when no records exist.

## 4. Quote requests

Open **Quotes** to search, filter by status/category, sort and page through requests.

Each request contains:

- Server-generated reference
- Full name, optional organisation, email and phone
- Service category and requested service
- Project description
- Preferred contact method
- Optional budget range and preferred completion date
- Consent record
- Submission and update timestamps
- Notification statuses
- Internal notes
- Current status

### Quote status workflow

```text
New ─────────► Under Review ─────► Quoted ─────► Accepted ─────► In Progress ─────► Completed
 │                  │                 │              │                 │
 └────► Rejected ◄──┴─────────────────┴──────────────┴─────────────────┘
            │
            └────► Under Review
```

Rules:

- `New` → `Under Review` or `Rejected`
- `Under Review` → `Quoted` or `Rejected`
- `Quoted` → `Accepted` or `Rejected`
- `Accepted` → `In Progress` or `Rejected`
- `In Progress` → `Completed` or `Rejected`
- `Rejected` → `Under Review`
- `Completed` is terminal
- Saving the same status is a no-op

The UI offers only allowed next statuses, and the API rejects any other transition with `422`.

### Working a quote

1. Open the request from the table.
2. Read the description and confirm the customer’s preferred contact method.
3. Move it to **Under Review** once work starts.
4. Add internal notes for context that other staff need.
5. Move it to **Quoted** only after a quotation has actually been prepared and sent by your normal process.
6. Continue through **Accepted**, **In Progress** and **Completed** as the engagement progresses.
7. Use **Rejected** with a note when declining. Rejected requests can be reopened to **Under Review**.

The website does not send quotations automatically. Status changes are internal records.

### Notification status

Each submission records email delivery attempts:

| Status | Meaning |
| --- | --- |
| `pending` | No attempt recorded |
| `sent` | The email provider accepted the message |
| `failed` | The provider rejected or could not be reached |
| `skipped` | Email is disabled or not configured; nothing was delivered |

`sent` does not prove inbox delivery, and `skipped` means no email was sent. Follow up by phone or email if a customer has not heard from the team.

## 5. Contact messages

Open **Contacts** to search, filter by status, sort and page through messages.

Available statuses:

- **New**
- **In Progress**
- **Resolved**

Open a message to see contact details, subject, body, consent and notification status. Add internal notes and update the status. Notes are for internal use and are not shown to the customer.

## 6. Course registrations

Open **Registrations** to see training applications.

Each record includes:

- Server-generated reference
- Applicant name, email, phone and optional organisation
- Course and preferred start date
- Applicant message
- Consent record
- Status, notes, timestamps and notification status

### Registration workflow

```text
Pending ──► Confirmed ──► Completed
   ▲            │
   │            ▼
   └─────── Cancelled
```

- `Pending` → `Confirmed` or `Cancelled`
- `Confirmed` → `Completed` or `Cancelled`
- `Completed` is terminal
- `Cancelled` → `Pending` (reopen)

A registration is **not** a confirmed place. Only move it to **Confirmed** after checking schedule, fees and availability with the applicant.

## 7. Catalogue content

Administrators can manage services, courses, projects and products. Staff can view lists (where permitted) but cannot edit.

### Services

Fields include title, slug, category (business/ICT/training), summary, description, features, icon, published flag, featured flag and sort order.

- Published services appear on the relevant public service page.
- Featured services may be highlighted on the homepage.
- The slug must be unique and URL-safe.

### Courses

Fields include title, slug, category, summary, description, duration, price, currency, published flag and sort order.

- Leave price/duration blank if not confirmed. The website displays “on request” rather than inventing a figure.
- Only published courses are available for public registration.

### Projects

Fields include title, slug, category, client name, summary, description, completion date, published flag, sample flag and sort order.

- **Published** controls public visibility.
- **Sample record** keeps a record hidden from public pages even if published. Use it for demonstration data only.
- Do not publish a project unless the work was actually completed and the client information is accurate and permitted to be shown.
- Gallery images can be added by URL or uploaded. Each image needs meaningful alt text.

### Products

Fields include SKU, name, slug, category, description, price, currency, stock tracking, stock quantity, low-stock threshold, published flag, sample flag and sort order.

- Leave price blank if not confirmed; the website shows “Price on request”.
- Stock can be adjusted separately by staff with `products:stock`.
- Sample records stay hidden from public pages.
- Only publish products that are genuinely available.

### Staff profiles

Administrators manage public profiles: name, title, bio, photo URL, email, public flag and sort order.

- No staff profiles are seeded. The public page shows an honest empty state until real profiles are added.
- Only set **Public** when the person has agreed to appear.

## 8. Stock

Open **Products & stock** and choose **Stock** on a product.

- Enable stock tracking only when you maintain counts.
- Enter a non-negative quantity.
- Set a low-stock threshold to surface warnings on the dashboard.
- Stock changes are audited.

Stock is not decremented automatically by website enquiries, because products are not sold through a checkout.

## 9. Project gallery

Inside a project, open the gallery to:

- Add an image by uploading a file or pasting an image URL.
- Set alt text for accessibility.
- Remove an image with confirmation.

Uploads accept JPEG, PNG and WebP up to 5 MB. The server stores them in the public `media` bucket under a random name.

## 10. Settings and content

Administrators can edit two settings records.

### `company_profile`

- Company name and short name
- Tagline
- Email address
- Phone display and phone link
- Registration number
- TIN
- Location
- Postal address

These values are served publicly through `GET /api/v1/site`. Check them carefully; they appear in the header, footer, contact page and email templates.

### `homepage`

- Hero eyebrow, title and description
- Primary and secondary button labels
- Supporting note

The homepage setting controls copy only. It does not fabricate projects, testimonials or client counts.

Saving a setting writes an audit record.

## 11. Exports

Use the **Export CSV** button on supported lists. Exports respect the current search/filter and are capped at 5,000 rows.

Available exports:

- Quotes
- Contacts
- Registrations
- Products
- Projects
- Courses
- Services
- Activity logs (admin only)

Files are UTF-8 with a BOM, open correctly in spreadsheet software, and escape formula-like values. Exports are themselves audited.

CSV files contain personal data. Store and share them securely, and delete them when no longer needed.

## 12. Audit log

Administrators can open **Audit log** to see administrative activity.

Each entry contains:

- Time
- Actor email
- Action (e.g. `quote.update`, `registration.update`, `create`, `delete`, `export`)
- Entity type and ID
- Metadata summary (changed fields, status from/to, counts)
- Salted IP hash

Filter by entity and action, search, sort and page. Audit entries are written by the API and cannot be edited in the UI.

The audit log records administrative actions, not customer submissions. It does not store full submission text.

## 13. Common tasks

### Publish a new service

1. **Services → New service**.
2. Fill in title, slug, category, summary and description.
3. Add features if useful.
4. Leave **Published** off while drafting; save.
5. Preview the content in the list.
6. Turn **Published** on when ready.
7. Verify it appears on `/services/business`, `/services/ict` or `/training`.

### Publish a course and open registration

1. **Courses → New course**.
2. Complete the outline and leave price/duration blank if unknown.
3. Publish the course.
4. Confirm it appears on `/training`.
5. Submit a test registration from `/training/register` and confirm it appears in **Registrations**.
6. Delete the test registration only if you have a deliberate process for removing records; otherwise mark it **Cancelled** with a note.

### Add a real project safely

1. Remove the **Sample** flag only after verifying the work is real.
2. Confirm the client has agreed to be named, or omit the client name.
3. Add a factual summary and description; do not invent outcomes, metrics or testimonials.
4. Add gallery images with alt text.
5. Publish.
6. Check `/projects` and the detail page.

### Handle a suspicious submission

1. Do not click unverified links in the message.
2. Keep the record; add an internal note.
3. Mark it **Rejected** (quotes) or **Resolved** (contacts) with a note such as “spam”.
4. Export only if needed for investigation.
5. If abuse is sustained, enable a CAPTCHA/WAF challenge or tighten rate limits at the platform layer.

## 14. Limitations and safe operation

- The admin UI does not send quotations or replies. Use your normal email/phone process.
- Email delivery is not guaranteed. Check notification statuses and follow up manually.
- There is no public customer portal; customers cannot track quote status.
- There is no automatic stock reservation or e-commerce checkout.
- Records are deleted permanently from the UI. Prefer status changes over deletion for operational history.
- Sample projects/products are intentionally hidden publicly. Do not clear the sample flag for fictional data.
- The current `npm audit` report includes dependency advisories that require planned major upgrades. See [SECURITY.md](SECURITY.md).

## 15. Troubleshooting

| Problem | Check |
| --- | --- |
| Cannot sign in | Account exists in Supabase Auth; password correct; account confirmed |
| Signed in but “no staff access” | An admin must assign `admin` or `staff` in **Users & roles** |
| Menu item missing | Your role lacks that permission; ask an admin |
| Data list is empty | Database migrations/seed not applied, or filters hide records |
| Quote status greyed out | The transition is not allowed from the current status |
| “At least one administrator must remain” | Assign another admin before removing the last one |
| Settings save fails | Only `company_profile` and `homepage` are accepted; required fields must be valid |
| Upload fails | Use JPEG/PNG/WebP up to 5 MB; check the `media` bucket exists |
| Email status is `skipped` | `EMAIL_PROVIDER=none` or provider not configured; no email was delivered |
| Email status is `failed` | Check provider credentials, verified sender and provider logs |
| Password reset link wrong domain | Update Supabase Site URL and redirect URLs |
| CSV shows strange characters | Open as UTF-8; the BOM is intentional for Excel compatibility |
