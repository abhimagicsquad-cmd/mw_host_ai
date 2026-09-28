# Custom CMS (replaces Sanity Studio)

The website's content is now managed from a built-in admin at **`/admin`**, backed by Supabase (Postgres + Storage). Sanity is kept only as a read-only fallback until its content has been imported, after which it can be removed.

## One-time setup

1. **Run the migration.** Open the Supabase SQL editor for project `apozsxenyhrgwlhycxcp` and run [`supabase/migrations/0004_create_cms.sql`](../supabase/migrations/0004_create_cms.sql). It creates the CMS tables, seeds the `abhiadmin` super admin and the empty header/footer menus and settings rows. It is idempotent — safe to re-run. It also creates `orders` / `newsletter_subscribers` if `0002`/`0003` were never applied.
2. **Sign in** at `/admin/login` as `abhiadmin`, then **change the password** at `/admin/profile` (the dashboard nags until you do).
3. **Import existing content.** Dashboard → *Migration & maintenance* → **Import from Sanity**. This copies the Home, About, Contact and Hosting/Domain/Email hub pages (with their SEO), both menus and the site settings. Leave "publish immediately" unticked to review drafts first; the site keeps serving Sanity until each page is published.
4. Optional: set `ADMIN_SESSION_SECRET` on Vercel (see `.env.local.example`). Without it, the session key is derived from `SUPABASE_SERVICE_ROLE_KEY`.

The Storage bucket `cms-media` (public, 20 MB, JPG/PNG/SVG/WEBP/PDF) is created automatically on first upload.

## How content reaches the website

Every content getter in [`src/sanity/lib/queries.ts`](../src/sanity/lib/queries.ts) now resolves in this order:

**CMS (Supabase, published)** → **Sanity** → **hardcoded defaults in the page component**

| What | Where it's edited | Where it shows |
|---|---|---|
| Page-builder pages | Pages / Content | `/`, `/about-us`, `/contact-us` (content above the forms), `/hosting`, `/domain`, `/email-hosting`, and any **new URL** via the catch-all route `src/app/(site)/[...slug]` |
| Blog posts (`page_type = blog`, URL `/blog/<slug>`) | Content → Blog Posts | `/blog`, `/blog/<slug>` (merged with the existing posts) |
| Header / footer menus | Menus | Site header & footer |
| Site name, contact details, hours, header button, social links | Settings | Top bar, header, footer |
| Meta title/description, canonical, noindex, Open Graph, Twitter card | SEO (any URL, including built-in pages) | `<head>` of that URL via `applySeoOverrides` in `src/lib/seo.ts` |
| Schema JSON-LD | SEO → Schema | CMS-managed pages (the integrated pages above + catch-all pages) |

Public reads are cached in Next's data cache under the `cms` tag; every admin save calls `updateTag("cms")`, so changes are live on the next request without a redeploy.

Built-in routes that don't render page-builder sections (e.g. `/ssl`, `/vps-hosting`, `/hosting/<plan>`, `/legal/*`) can't be taken over by a CMS page — `validatePagePath` blocks those URLs — but their SEO is still editable under SEO.

## Admin features

- **Auth** — username/password (scrypt-hashed), HMAC-signed httpOnly session cookie scoped to `/admin` (8 h), `src/proxy.ts` gate + a database re-check on every admin page and server action, per-IP/username login throttling, audit-logged sign-ins and failures.
- **Roles** — Super Admin (everything), Admin (everything except users), Editor (pages, content, media, SEO, menus; no deleting pages, leads, settings or users). The matrix lives in `src/lib/admin/permissions.ts` and is shown at Users → Roles & Permissions.
- **Pages** — create (blank / basic / landing starters), edit details, build content from 13 section types (hero, page header, banner, stats, pricing, trust highlights, service cards, about, features, testimonials, FAQ, CTA, rich text), reorder by drag-and-drop or arrows, hide/duplicate sections, publish/unpublish, duplicate and delete pages.
- **Media** — drag-and-drop multi-upload straight to Supabase Storage via signed URLs (no serverless body limit), folders (images/icons/documents), search, type filter, sort, preview, copy URL, alt text, replace in place, delete. Image fields across the admin can pick from the library.
- **Forms** — leads, orders and newsletter sign-ups with search and CSV export.
- **Activity logs** — filterable, paginated audit trail.
- **Dark mode** — toggle in the top bar (stored in a cookie, so no flash on load).

## Adding a new section type

1. Add the block's React rendering as a new `case` in [`src/components/sanity/page-builder.tsx`](../src/components/sanity/page-builder.tsx) and its type to `PageBuilderBlock` in `src/sanity/types.ts`.
2. Add a `SectionType` entry in `src/lib/cms/types.ts`.
3. Describe its fields and defaults in [`src/lib/cms/section-schemas.ts`](../src/lib/cms/section-schemas.ts) — the admin editor form is generated from that definition.

## Code map

| Path | Purpose |
|---|---|
| `supabase/migrations/0004_create_cms.sql` | Tables: `users`, `pages`, `page_sections`, `media`, `seo`, `menus`, `activity_logs`, `settings` |
| `src/lib/cms/` | Row types, section schemas, public (cached) reads, path rules, Markdown ⇄ Portable Text |
| `src/lib/admin/` | Session, passwords, permissions, auth guards, activity log, admin queries |
| `src/lib/admin/actions/` | Server actions (auth, pages, media, SEO, menus, users, settings, Sanity import) |
| `src/app/admin/` | Admin routes (`login`, and everything else under the `(panel)` layout) |
| `src/components/admin/` | Admin UI components |
| `src/proxy.ts` | Redirects unauthenticated `/admin/*` requests to the login page |

## Retiring Sanity

Once the import is done and the pages are published, Sanity only serves content types the CMS doesn't model yet (service/plan detail pages, legal pages, knowledge base, pricing plans). Those still fall back to their hardcoded content if Sanity is removed, so removing `/studio`, `sanity.config.ts` and the Sanity packages is safe whenever that fallback content is acceptable.

## Break-glass login

`ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD` allow signing in **only while the `users` table is missing or empty** (before the migration). It switches itself off as soon as any user exists. Leave both unset in production.
