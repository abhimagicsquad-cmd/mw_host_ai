# Content migration: Sanity & hardcoded content → custom CMS

Status: **complete — Sanity removed on 2026-09-30** (see [Sanity removed](#sanity-removed-2026-09-30)). The sections below describe the migration as it was carried out.

## Fallback chain (unchanged in spirit, now covering every page)

```
Custom CMS (published page)  →  Sanity document  →  hardcoded content in the route / src/constants
```

- A CMS page only takes over its URL once it is **published**. Drafts never affect visitors.
- **SEO rows attached to a CMS page go live with the page** (`getSeoOverride` ignores them while the page is a draft).
- Unpublishing any page instantly returns that URL to Sanity / hardcoded content.
- Admins can check drafts on the real site with **Preview** (Next.js draft mode, `/admin/preview?path=…`); a banner marks preview mode and "Exit preview" leaves it.

## How content is modelled

| Model | Used for | Editor |
|---|---|---|
| **Page builder** — ordered sections (`page_sections`) | Home, About, Contact, Hosting / Domain / Email hubs, custom pages | Section builder (add, reorder, hide, duplicate sections) |
| **Structured template** — one `template:<key>` section holding the content JSON | Service pages, legal, support, affiliate, comparison, thank-you, knowledge base, blog home, blog posts, promotions | Form generated from `src/lib/cms/templates.ts`; the coded route renders it with the existing design |
| **Collection** — `settings` row `collection:pricingPlans` | All pricing plans | Content → Pricing Plans (draft until "Use these plans on the website" is ticked) |

The template for a URL is derived from the URL (`templateForPath`), so a page can't end up with the wrong template. New pages at template URLs (e.g. `/legal/refund-policy`, `/hosting/cloud-hosting`, `/blog/new-post`, `/promo/diwali`) are created as template pages automatically and served by the existing routes.

New page-builder sections added for parity: **Domain prices strip**, **Contact form**, **Quote request form**. Pricing sections can reference a service (e.g. shared hosting) so they always show the current Pricing Plans.

## Audit — where each page's content came from

| Page(s) | Before migration (live source) | Imported from | CMS model |
|---|---|---|---|
| `/` Home | Sanity (10 sections) | Sanity | Page builder |
| `/about-us` | Sanity (6 sections) | Sanity | Page builder |
| `/contact-us` | Hardcoded layout + forms (Sanity SEO) | Hardcoded | Page builder (incl. both form sections) |
| `/hosting`, `/domain`, `/email-hosting` hubs | Hardcoded body, Sanity SEO | Hardcoded | Page builder |
| `/hosting/*` (5), `/domain/*` (6), `/email-hosting/*` (2), `/dedicated-hosting/*` (3), `/ssl`, `/vps-hosting` | Sanity `servicePage` (17 docs) + hardcoded fallbacks | Sanity (+ hardcoded where Sanity lacks a page, e.g. `/domain/renew`) | Service page template |
| `/ssl/*` (5 certificate pages) | Hardcoded | Hardcoded | Service page template |
| `/legal/*` (4) | Sanity | Sanity | Legal template |
| `/support`, `/become-our-affiliate`, `/compare-hosting-plans`, `/thank-you` | Sanity | Sanity | Templates |
| `/knowledge-base` + category pages | Sanity (page, 6 categories, 13 articles) | Sanity | Knowledge base template |
| `/blog` + 8 posts | Hardcoded (Sanity has no posts) | Hardcoded | Blog home + blog post templates |
| `/promo/50-off` | Hardcoded | Hardcoded | Promotion template |
| Pricing plans (17) | Sanity | Sanity | Collection |
| Header / footer menus, site settings | Sanity | — (separate one-click copy, see below) | Menus / Settings |

Functional pages (`/domain/search`, `/search`, `/order/*`, `/tools/*`, `/sitemap-page`) aren't content; their SEO is managed under SEO. KB and blog **category** pages are generated from the KB / blog home content.

## Verification performed (against the production database, drafts only)

- **Import:** 48 pages + 17 pricing plans created as drafts; re-running creates nothing (idempotent).
- **Public site unchanged** after import (visible text of every sampled page identical).
- **Draft parity:** for all 48 pages, the draft rendered through preview produces **identical `<main>` markup** (classes, icons, links), visible text, `<title>` and meta description as the live page. (Ignored: React streaming placeholders that only exist in dynamic renders.)
- **Editing (preview):** template text, bullets, FAQs, heading/button/stat overrides; builder headings, buttons, hiding sections; pricing price change reflected on home, hub, service page and comparison page; knowledge-base article reaching its category page; blog post edit rendered with the blog template and listing — each invisible on the public site, then restored byte-for-byte.
- **Lifecycle:** new template page → draft 404 publicly → preview renders → SEO on draft visible only in preview → publish (live instantly with its SEO) → unpublish (404) → delete (SEO cascades).
- **Guards:** template page can't move to a non-template URL; singleton pages can't be duplicated; preview refuses non-admins; exit preview works without a session.
- **Regression:** phase-1 suite (auth, roles, CRUD, media, SEO, logout) 57/57.
- `tsc`, `eslint`, `next build`: clean; all public pages still statically rendered.

## Findings

1. **USA pricing tabs are empty today** on `/vps-hosting` and `/dedicated-hosting/*`: none of Sanity's VPS/dedicated plans has a region, and the built-in USA plans are ignored when Sanity has plans. Migrated as-is (parity); after publishing Pricing Plans, add the USA plans with region "USA" to fix.
2. **SSL buttons differ between pages today**: the `/ssl` pricing grid uses Sanity plans (button opens the lead form) while the certificate pages use built-in plans (button goes to checkout). Migrated as-is.
3. During this phase an early import wrote Sanity SEO rows that production (running `main`) applied for a few minutes — `/about-us`, `/contact-us` and `/hosting` titles lost the " | MagicWorks Host" suffix. Rows were removed, the production cache cleared and titles verified restored. The importer no longer writes SEO (all Sanity SEO equals the built-in defaults), and this branch makes draft-page SEO inert.

## Rollout (after approval)

1. Merge this branch (production deploys automatically). **Do not publish migrated pages before this code is live**: production's current code doesn't know the new section types or template pages.
2. Content → Pricing Plans → tick "Use these plans on the website" → Save.
3. Content Migration → review/preview → **Publish selected** (can be done group by group).
4. Content Migration → **Copy menus & site settings from Sanity** (identical content; goes live immediately).
5. Spot-check the live site; unpublish any page to fall back instantly if needed.

## Remaining Sanity-managed content

Until step 3/4 above: every page listed in the audit (Sanity is the live source for those marked "Sanity"), the pricing plans, both menus and the site settings. After steps 2–4, Sanity serves nothing that the CMS doesn't also hold; it remains only as the fallback for unpublished pages.

Not migrated (not used by any page, or no CMS field): Sanity `siteSettings` logo/favicon/footer rich text (the site uses static logo files), and the Studio itself (`/studio`).

## Still hardcoded (not editable from the dashboard)

Small fixed elements of templates that have no CMS field yet: the footer trust badges and newsletter block, the VPS page's "Why upgrade" stats and testimonials, the SSL page's certificate-type grid (built from the SSL certificate pages), the domain pages' TLD price strip and shared "included" features (overridable per page via Features), the blog post closing banner, and JSON-LD product markup (derived from page content). These can be added as template fields if needed.

## Recommendations for the Sanity removal phase

1. Run with all pages published for an agreed period (e.g. 2–4 weeks) while Sanity stays connected.
2. Freeze Sanity edits (any change there is invisible once a page is published in the CMS).
3. Export a Sanity dataset backup (`sanity dataset export production`).
4. Remove in one PR: `/studio` route, `sanity.config.ts`, `src/sanity/schemaTypes`, `src/sanity/structure.ts`, `scripts/migrate-content.mjs`, the Sanity branches of `src/sanity/lib/queries.ts` (keep the CMS + hardcoded chain), `next-sanity`, `sanity`, `@sanity/*` packages, `/api/revalidate` webhook route, and the `SANITY_*` env vars.
5. Keep the hardcoded fallbacks as the safety net (or retire them template by template once the CMS content is confirmed).

## Sanity removed (2026-09-30)

The dashboard is now the only content source: **dashboard (published) → built-in content** in `src/constants` and the routes.

**Data moved before removal** (backups of every changed row and a full Sanity dataset export were taken first):

- All 49 pages were already published in the dashboard.
- Header and footer menus and the remaining site settings (name, tagline, description, address, business hours, header button) were copied from Sanity. Existing dashboard values were kept.
- Pricing Plans were replaced with the WordPress-verified set and published: 27 plans (6 NVMe shared, VPS and dedicated India + USA, 5 SSL, 2 email). The six USA shared plans stay built-in for now. Add them to Pricing Plans with region "USA" once the region-aware code is deployed, so they don't appear in the India grids.
- The compare page's table rows were updated to the six-plan WordPress specs.

Public reads are cached under the `cms` tag, so direct database changes go live after **Clear website cache** in the dashboard's system tools (or after any dashboard save).

**Removed:** `/studio`, `sanity.config.ts`, `src/sanity/*` (client, schemas, structure, queries), the `/api/revalidate` webhook, `scripts/migrate-content.mjs`, and the `sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/vision` and `styled-components` packages. Content getters now live in `src/lib/cms/queries.ts`, content types in `src/types/cms-content.ts`, and the page builder in `src/components/page-builder/`.

**Rich text:** `@portabletext/react` was replaced by `src/components/common/rich-text.tsx`, which renders the stored Markdown directly (same HTML).

**Retired dashboard pieces (cleanup, same day):** the Content Migration screen (`/admin/migration`), its import/publish actions, the migration planner and content audit, the "Copy menus & site settings" action and the `system.import` permission (now `system.cache`, which guards only Clear website cache). Pages are published from Pages as before.

**Environment:** the `SANITY_*` and `NEXT_PUBLIC_SANITY_*` variables are no longer read and can be deleted from Vercel and `.env.local`.
