# Launch readiness: WordPress → Next.js cutover

Branch: `feature/launch-readiness` (stacked on `feature/cms-content-migration`). Nothing here has been deployed to production. Sanity stays connected as the fallback.

## 1. URL inventory & migration

- The live WordPress site (`https://magicworkshost.com`; `www` 301s to the apex) publishes **109 URLs** in its sitemaps: 42 posts, pages, categories and SSL/landing pages.
- Every legacy URL maps to a new page in `next.config.ts` (`legacyPages`). Each is emitted with and without the trailing slash as a **single-hop 308**.
- Pattern rules catch the rest:
  - `/clients/*` → WHMCS.
  - `wp-admin` / `wp-login` → `/`.
  - `author`, `tag` and `page` archives → `/blog`.
  - `/:slug/feed` → `/blog`.
  - Any other trailing slash is stripped.
- The 42 WordPress articles now live at `/blog/<slug>`.
  - `scripts/import-wordpress-posts.mjs` imports them into `src/constants/legacy-blog-posts.json`, keeping title, description, dates, author and body.
  - 4 over-long or duplicate titles are rewritten via `TITLE_OVERRIDES`.
- Three missing policies were imported from WordPress (`src/constants/legacy-legal.json`):
  - Mail policy.
  - Affiliate programme terms.
  - Resource abuse policy.
- The USA web hosting page was added: `/hosting/usa-web-hosting`, with the 6 USA plans.

**Verified:** 217/217 legacy URL variants (109 paths, with and without the trailing slash) reach a 200 in ≤ 1 hop. 0 fail and 0 need multiple hops.

## 2. Checkout, login & client area (WHMCS)

The mock `/order` checkout, its API and its store are **removed**. Billing stays on the existing WHMCS at `https://www.magicworkshost.com/clients` (`src/lib/billing.ts`, overridable with `NEXT_PUBLIC_BILLING_URL`).

| Surface | Now goes to |
|---|---|
| Every "Buy Now" on a mapped plan | `cart.php?a=add&pid=<pid>&billingcycle=<cycle>&promocode=<promo>&skipconfig=1`. Same pids, cycles and promos as the WordPress buttons; all 36 pids verified live. |
| Unmapped plans (India VPS Silver) | Lead form. WordPress links this button to the wrong product (pid 115 = shared Unlimited). |
| `/order/<plan>` (old links) | 307 to the plan's WHMCS cart, or `/contact-us`. |
| Login / client area | `…/clients/clientarea.php` |
| Domain search widget | WHMCS domain checker (`cart.php?a=add&domain=register&query=`). The fake availability check is removed. |

**DNS cutover:** point **only the apex** `magicworkshost.com` to Vercel, and keep `www` on the current server. WHMCS lives at `www…/clients` and `clients.magicworkshost.com` doesn't exist. Before the cutover, change WordPress's canonical host, or disable its www→apex redirect, so that `www…/clients` keeps serving WHMCS.

## 3. SEO, GEO & AEO

- **Metadata.**
  - `buildMetadata` normalises descriptions to 70–160 characters.
  - Titles that would run past 60 characters with the brand suffix are used as they are (absolute).
  - Every page has a canonical URL on the apex host.
- **Social images.** Every page has an OG/Twitter image. The default is `/opengraph-image`: a 1200×630 card with the MagicWorks Host logo.
- **Sitemap and robots.**
  - `sitemap.xml` covers every indexable page, including blog categories, SSL pages and domain search. Post `lastmod` comes from real dates.
  - `robots.txt` blocks `/api`, `/admin`, `/studio` and `/order`, and explicitly allows the major AI crawlers.
- **Entity data (GEO).**
  - An Organization + LocalBusiness + WebSite graph with legal name, founding year, full postal address, contact points and `sameAs` pointing to the real Facebook, X, LinkedIn and Instagram profiles.
  - `/llms.txt` gives answer engines a plain-text map of the site.
- **Answer-first content (AEO).** Each of the 24 product pages has a direct definition answer ("What is VPS hosting?"), key facts and "How to get started" steps, all with `HowTo` schema. Each also links to the matching blog topic cluster (`src/constants/service-answers.ts`, `AnswerSection`).
- **Structured data.** `BlogPosting` (real dates, word count, section), `Product`/`Offer`, `FAQPage` and `BreadcrumbList`, all validated as parseable JSON-LD on every crawled page.
- **Search.** Ranked, tokenised `/search` covering products, SSL, policies, help pages, the blog and the knowledge base. There is also a branded 404 page with search and key links.

## 4. Performance

- **`Reveal`.** It no longer server-renders content at `opacity: 0`. Only elements that start below the fold are hidden after mount, so the hero (the LCP element) paints without waiting for hydration. Mobile LCP render delay was 2.4–2.8 s.
- **Blog listing.** It sends only card fields to the client (`BlogExplorer` server wrapper). Full article bodies of 50 posts were previously serialised into the page.
- **Form libraries.** react-hook-form + zod (a 317 KB chunk) no longer ship on every page. The footer newsletter form is dependency-free, and the page-builder, hosting and support forms load through `components/forms/lazy-forms.tsx`. Home-page JS went from 382 KB to 288 KB gzipped, and product/blog pages to about 275 KB.
- **zod `jitless`.** zod runs in `jitless` mode, so it never probes `new Function`. The CSP (no `'unsafe-eval'`) reports 0 violations.
- **Turnstile.** The script loads only on form interaction in the footer, and never when the keys are unset.

## 5. Accessibility

- **Brand orange.** `#ff6600` measured 2.9:1 on white, so it is now **`#b84300`** (5.5:1) for text and buttons. `#ff7a1a` is used for orange text on navy (4.7:1).
- **Grey text.** Body grey is `#666` and muted grey `#636363`, both AA on `#f5f5f5`.
- **Other fixes:**
  - A skip-to-content link.
  - `main#main-content`.
  - 24 px carousel dot targets.
  - 12 px minimum label size.
  - A labelled search input.

## 6. Security

- **Headers.** CSP, HSTS (no `includeSubDomains`, since other subdomains stay on the old server), `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy and Permissions-Policy. `X-Powered-By` is removed. COOP is deliberately not sent: `same-origin` breaks Lighthouse/PageSpeed Insights traces, and framing is already blocked.
- **Cloudflare Turnstile.**
  - It covers the lead, quote and newsletter forms, with server-side verification in `/api/leads` and `/api/newsletter`.
  - It turns on when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are both set.
  - Until then, the existing honeypot, minimum fill time and rate limit apply.
- **Admin dashboard.** The existing login URL, username, credentials and workflow are unchanged. A change of the original password is recommended but not forced. Existing protections:
  - scrypt password hashing, with timing-safe checks.
  - A 15-minute pause after 5 failed attempts, and every failed login is logged.
  - An HttpOnly, Secure, SameSite=Lax session cookie scoped to `/admin`, with the user re-checked on every request.
  - Origin-checked server actions (CSRF).
  - Admin pages are noindex and no-store.
- **Cache.** Sanity reads revalidate hourly, and "Clear website cache" also clears Sanity. This fixes stale Sanity content such as the "10X fasters" headline.

## 7. Verification results (production build, 2026-09-29)

All figures come from `next build && next start`, measured on the same machine. The Vercel preview sits behind SSO deployment protection, so it couldn't be audited directly.

| Check | Result |
|---|---|
| Legacy WordPress URL variants → 200 in ≤ 1 hop | 217 / 217 |
| Crawled pages returning 200 (sitemap plus discovered links) | 108 / 108, with 0 not in the sitemap |
| OG and Twitter image coverage | 108 / 108 |
| JSON-LD blocks that fail to parse | 0 |
| Pages by schema type | BreadcrumbList 107, BlogPosting 50, FAQPage 29, HowTo 24, Product 18, Organization/LocalBusiness/WebSite on the home page |
| Checkout links | 24 cart links (23 pids), 0 invalid pids, 0 mock `/order` links |
| Login links | all point to `www.magicworkshost.com/clients/clientarea.php` |
| Responsive checks (108 pages × 390 / 768 / 1440 px) | 0 horizontal overflow, 0 console errors, 0 nav mismatches |
| CSP violations (home, product, contact, blog) | 0 |
| Dashboard (20 checks) | Current credentials sign in to the dashboard, and all sections load. Wrong password, signed-out access and cross-origin action requests are refused. Cookie flags are correct |
| Contact details | +91 9764746633 and sales@magicworkshost.com on all 108 pages (header, footer, contact page, schema); 0 pages with the old number or a Gmail address |
| Testimonials | The 4 WordPress testimonials (with photos) show on `/`, `/hosting` and `/vps-hosting`; 0 pages with invented testimonials |

### Lighthouse: before (commit 678f2ea) vs after, identical local conditions, 12 templates

| Category | Mobile before → after | Desktop before → after |
|---|---|---|
| Performance | 84 → **87** (range 82–92) | 99 → **100** (range 99–100) |
| Accessibility | 95 → **99** (range 96–100) | 96 → **99** (range 96–100) |
| Best practices | 100 → **100** | 100 → **100** |
| SEO | 100 → **100** | 100 → **100** |

Mobile total blocking time fell on almost every page (for example home 310 → 90 ms and VPS 230 → 120 ms).

**Mobile performance is below the 95 target.** In the observed trace, LCP paints at the same moment as FCP on every page, so nothing is waiting on JavaScript. Lighthouse's simulated slow-4G / 4× CPU model still charges the ~217 KB (brotli) of JS that downloads before paint. About 82 KB of that is React/Next itself; the rest is the interactive header menu, mobile nav, FAQ accordion, pricing tabs and carousel. Closing the gap means replacing those with CSS-only or server-rendered versions, which is post-launch work. Serving from Vercel (HTTP/2 + brotli) usually scores a few points higher than a local `next start`.

## 8. Before launch — owner actions

Done already:
- **Contact details** now match magicworkshost.com (+91 9764746633, sales@magicworkshost.com) in the dashboard settings, Sanity and the code defaults.
- **Social links** are the real profiles.
- **Testimonials:** the 4 real WordPress testimonials replaced all 8 invented ones in the dashboard, in Sanity and in the code defaults.

The step-by-step launch sequence is in `docs/14-dashboard-handover.md`:
1. Merge PR #2, then PR #3.
2. Publish the drafts in the dashboard.
3. Add the Turnstile keys.
4. Add the domain in Vercel and move DNS for the apex only.
5. Resubmit the sitemap.
