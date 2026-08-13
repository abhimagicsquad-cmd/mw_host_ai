# Reference-Parity & Production-Readiness — Gap Analysis and Implementation Report

**Scope:** Full feature/content/design/user-flow audit against the reference site (`magicworkshost.com`, forensically audited in `01-website-audit-report.md`) and this repo's own planning docs, followed by implementation of every non-sensitive gap found. See `docs/00-plan` (the approved implementation plan, `smooth-doodling-eclipse.md` in the session's plan store) for the phase-by-phase breakdown this report summarizes.

**Method:** A 5-way parallel audit (pricing/checkout, testimonials, hero visual quality, SEO/structured data, missing routes/forms) established the gap list; 7 implementation phases closed it; `npx tsc --noEmit`, `npm run lint`, and `npm run build` were run after every phase and pass clean as of this report (79 routes build successfully, including the new ones below).

---

## 1. Checkout / Pricing — what existed, what was missing, what was built

| | Reference site | Before this pass | After this pass |
|---|---|---|---|
| Purchase flow | Static links to external WHMCS `cart.php` | Every "Buy Now" opened the same generic lead-capture modal — no cart, no account step, no payment step | Full mock checkout: `/order/[planSlug]` — configure (billing term) → account details → review → mock payment ("Test Mode", no live gateway) → `/thank-you?type=order` |
| Shared hosting tiers | 6 tiers (Starter/Basic/Basic Plus/Economy/Deluxe/Unlimited) | 4 tiers (Basic and Economy missing) | All 6 tiers, plus real 1/2/3-year billing-cycle pricing per tier for the checkout's configure step |
| VPS / Dedicated regions | India + USA side by side | India only | India + USA tabs on both VPS and Dedicated pricing (USA figures for tiers not directly in the audit are extrapolated from the confirmed India→USA discount trend — flagged in code comments as estimates pending real WHMCS confirmation) |
| SSL pricing | 4 real tiers on the hub, but a **flat-price bug** on individual cert pages | Only the hub had real differentiated pricing; no individual cert pages existed | 4 real, correctly-differentiated tiers everywhere, including 5 new dedicated cert-type pages (§5) — the reference site's flat-price bug is not repeated |
| Order persistence | External WHMCS database | None | New `orders` Supabase table (`supabase/migrations/0002_create_orders.sql`), written via `/api/orders` with the same rate-limiting/honeypot/duplicate-guard pattern as the existing leads pipeline |

**Still blocked on live credentials/infra:**
- No real payment gateway is connected — the payment step is explicitly labeled "Test Mode" and always simulates success.
- **`supabase/migrations/0002_create_orders.sql` has not been applied to the live Supabase project** — the table doesn't exist yet, so `/api/orders` currently returns a graceful 502 ("something went wrong saving your order") until someone runs this migration via the Supabase SQL editor or CLI. This was verified directly: a live test POST to `/api/orders` returns that exact error today, while the pre-existing `/api/leads` (whose table *is* provisioned) succeeds.

## 2. Testimonials — what existed, what was missing, what was built

| | Before | After |
|---|---|---|
| Slider mechanics | Real Embla carousel already in place (3/2/1 responsive), but no autoplay, no dots, no `aria-live`, no `prefers-reduced-motion` handling | Added `embla-carousel-autoplay` (pauses on hover/focus, disabled entirely when `prefers-reduced-motion: reduce`), pagination dots (`CarouselDots`), and a `role="status" aria-live="polite"` slide announcement — all added to the shared `ui/carousel.tsx` primitive, not one-off code |
| Content | 3 invented placeholder testimonials, hardcoded inline on the homepage only | 8 original, honestly-authored testimonials (grounded in real feature claims — NVMe speed, uptime, migration experience, VPS root access, email/SSL setup, dedicated-server consistency), moved to a shared `src/constants/testimonials.ts`, kept in sync with the Sanity seed script. **None are copied from the reference site's named customers**, per the task's explicit instruction. |
| Coverage | Homepage only | Added to the hosting hub and VPS pages too, for credibility signal on the top commercial pages |

## 3. Hero & visual completeness

The reported bug (`/hosting/seo-hosting`'s hero right side was an empty tinted box) turned out to affect **6 of 8** `HeroSection` call sites sitewide: `hosting/[slug]`, `ssl`, `dedicated-hosting/[slug]`, `email-hosting/[slug]`, `domain/[slug]`, `become-our-affiliate`. All 6 now render a real visual — `HeroVisual` was extended from one hardcoded "dashboard" graphic into 6 variants (`dashboard`, `security`, `server`, `mail`, `domain`, `affiliate`), each a pure Tailwind + lucide-react composition (no new binary image assets needed, matching the existing pattern exactly). `dedicated-hosting/[slug]` and `become-our-affiliate` also now pass a `stats` teaser into their heroes, matching the home/VPS pattern.

## 4. SEO / structured data completeness

| Gap found | Fix |
|---|---|
| `og:type` hardcoded to `"website"` everywhere, including blog posts | `buildMetadata()` now takes an `ogType` param; blog posts pass `"article"` plus `publishedTime` |
| `BreadcrumbList` only fired inside `PageHero`, so every `HeroSection` page (the highest-value commercial pages) had none | `HeroSection` gained a `breadcrumbs` prop (visible breadcrumb trail + `BreadcrumbJsonLd`), wired into all 7 `HeroSection` pages |
| No `Product`/`Offer` schema anywhere | New `ProductJsonLd` component, wired into every pricing page (hosting, VPS, dedicated, SSL hub + 5 SSL sub-pages, email) |
| `WebSite.potentialAction` (SearchAction) declared nowhere backed by a real feature | Built an actual `/search` page (static index over blog/hosting/domain/dedicated/email/knowledge-base content, no separate content source to drift), added a header search icon, and wired the matching `SearchAction` into `OrganizationJsonLd` |

## 5. Missing routes and functionality

| Route / feature | Status before | Status after |
|---|---|---|
| `/tools/bandwidth-calculator`, `/tools/data-unit-calculator`, `/tools/transfer-time-calculator` | Did not exist anywhere, not even as unwired components | Built, linked from the header (Resources menu) and footer |
| `/promo/[campaignSlug]` (`50-off`) | Did not exist | Built with a real countdown timer (`endsAt` is an editable constant) and derived discount pricing (endpoints match the reference site's anchors exactly: Starter ₹62/mo, Unlimited ₹349/mo) |
| `/blog/category/[category]` archives | Did not exist — category filtering was client-state-only on `/blog`, not a crawlable URL | Built as real server-rendered, indexable pages; blog post category badges now link to them |
| `/domain/search` | Reference site never had a working one despite a page named for it; ours didn't exist either | Built a real, interactive mocked availability checker — deterministic per-input results (not `Math.random()`, so it doesn't flicker), suggested alternatives when taken, and an explicit code-seam comment marking where a real registrar API (e.g. ResellerClub) plugs in later |
| `/domain/renew` | Did not exist | Built (templated content page, consistent with the reference site's own approach of deferring to account-area messaging) |
| `/ssl/[slug]` (5 cert-type sub-pages) | Did not exist — only the pillar page | Built all 5 (`domain-validated`, `business-validated`, `domain-validated-sni`, `extended-validated`, `wildcard`), each with its own hero/copy/FAQ, linked from both the SSL pillar page and the header's SSL menu |
| Affiliate earnings calculator | Described in the reference site's audit, not implemented here | Built — referrals/month × avg. customer value × 20% commission → month-12 recurring income and year-1 total, with a bar-chart visualization of the compounding growth |
| Newsletter signup | No working form anywhere despite `/thank-you?type=newsletter` being specced; `thank-you` ignored its `type` param entirely | Built a footer signup form (`/api/newsletter`, new `newsletter_subscribers` Supabase table) and fixed `thank-you/page.tsx` to render distinct copy per `type` (`contact` / `newsletter` / `affiliate` / `order`) instead of one generic message |

**Still blocked on live credentials/infra:**
- **`supabase/migrations/0003_create_newsletter_subscribers.sql` has not been applied** — same situation as the orders table; verified live (`/api/newsletter` currently returns a graceful error until the migration is run).
- The domain-availability checker is explicitly a deterministic mock — a real registrar API integration is a distinct future task requiring registrar credentials.

## 6. What still needs a human before launch

1. **Apply the two new Supabase migrations** (`0002_create_orders.sql`, `0003_create_newsletter_subscribers.sql`) via the Supabase SQL editor or CLI — this repo has no DB/DDL access configured for automated application, and this is the one functional gap found during end-to-end testing (confirmed by comparing against the pre-existing, already-provisioned `leads` table, which works correctly today).
2. **Connect a real payment gateway** to replace the checkout's "Test Mode" payment step once ready to accept live charges.
3. **Confirm the extrapolated VPS/Dedicated USA pricing** and the SSL/USA figures against real WHMCS data — they're clearly commented as estimates in `src/constants/pricing-plans.ts`, derived from the reference audit's confirmed endpoints, not invented from nothing.
4. **Real registrar API** for `/domain/search` if live domain availability (not a mock) is wanted before launch.
5. **Live SMTP/CRM/analytics keys** (Resend, Google Ads/GA4, Clarity, etc.) remain out of scope per the task's instructions — nothing in this pass wired up or required them; existing `RESEND_API_KEY`/Supabase env-var gating already degrades gracefully when unset.

## 7. Validation performed

- `npx tsc --noEmit` — clean after every phase and at the end.
- `npm run lint` — clean after every phase and at the end (one real bug caught this way: a `react-hooks/set-state-in-effect` violation in the new countdown timer, fixed).
- `npm run build` — clean, 79 routes generated. One real bug caught only at build time: the SSL pillar's own CMS slug (`ssl-certificates`) collided with the new `/ssl/[slug]` route and crashed prerendering; fixed by tightening the not-found guard to require a resolvable plan.
- Manual `curl` smoke tests against every new/changed route (200 for valid slugs, 404 for invalid ones) plus live POSTs to `/api/orders` and `/api/newsletter` to confirm the Supabase-migration gap directly rather than assuming it.
