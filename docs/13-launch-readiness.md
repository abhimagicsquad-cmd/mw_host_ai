# Launch readiness: WordPress → Next.js cutover

Branch: `feature/launch-readiness` (stacked on `feature/cms-content-migration`). Nothing here has been deployed to production. Sanity stays connected as the fallback.

## 1. URL inventory & migration

- The live WordPress site (`https://magicworkshost.com`; `www` 301s to the apex) publishes **109 URLs** in its sitemaps: 42 posts, pages, categories and SSL/landing pages.
- **The new site uses the WordPress URL structure itself, trailing slash included.**
  - All 109 WordPress URLs load at the same URL with a 200 and no redirect.
  - Examples: `/privacy-policy/`, `/wordpress-hosting/`, `/what-is-web-hosting/`, `/category/ssl-certificate/`.
  - How it works, and the full mapping table: `docs/15-url-parity.md`.
- Pattern rules catch the rest:
  - `/clients/*` → WHMCS.
  - `wp-admin` / `wp-login` → `/`.
  - `author`, `tag` and `page` archives → `/blog/`.
  - `/:slug/feed` → the post.
- The 42 WordPress articles are served at their original `/<slug>/` URLs.
  - `scripts/import-wordpress-posts.mjs` imports them into `src/constants/legacy-blog-posts.json`, keeping title, description, dates, author and body.
  - 4 over-long or duplicate titles are rewritten via `TITLE_OVERRIDES`.
- Three missing policies were imported from WordPress (`src/constants/legacy-legal.json`):
  - Mail policy.
  - Affiliate programme terms.
  - Resource abuse policy.
- The USA web hosting page was added: `/hosting/usa-web-hosting`, with the 6 USA plans.

**Verified:**
- 109/109 WordPress URLs are served at exactly the same URL.
- 217/217 variants (with and without the slash) reach a 200 in ≤ 1 hop.
- 0 internal links go through a redirect.

## 1a. Forms and email (Resend)

| Form | Where | Endpoint | Saved to | Admin email |
|---|---|---|---|---|
| Lead form | Contact, support, affiliate pages, and the "Talk to us" dialog behind every lead button | `POST /api/leads` | Supabase `leads` | "Enquiry from {name} — MagicWorks Host website" |
| Quote form | Contact page, hosting hub | `POST /api/leads` | Supabase `leads` | "Quote request from {name} — …" |
| Newsletter | Footer (every page) | `POST /api/newsletter` | Supabase `newsletter_subscribers` | "New newsletter subscriber: {email} — …" |
| Domain search | Domain pages | GET → WHMCS `cart.php?a=add&domain=register` | WHMCS | none |
| Site search | Header, `/search/`, 404 page | GET `/search/?q=` | none | none |

**Recipient and message:**
- Admin notifications go to **abhimagicsquad@gmail.com**. This is the default in `src/lib/email.ts`; `ADMIN_NOTIFICATION_EMAIL` overrides it.
- Reply-to is the customer, so replying answers them directly.
- Each email lists every field, the form, the page URL and the time (IST).

**Root cause of the missing notifications:** the first notification (2026-09-23) bounced at Gmail, so Resend put abhimagicsquad@gmail.com on its suppression list. Every notification since then was suppressed without an attempt, and nothing had been delivered. I removed the address from the suppression list on 2026-09-29.

**End-to-end result (2026-09-29, real browser, production build):**
- 4 real submissions went through the actual forms: contact lead, contact quote, service-page dialog and footer newsletter.
- All 4 returned API 200, landed on `/thank-you/` (or showed the success message), were saved in Supabase, and were **delivered** to Gmail according to Resend, each with a message ID.
- Validation also rejected empty, invalid-email and short-phone submissions with no request sent.

**Still to do — the sender domain:**
- Mail is sent from Resend's test sender `onboarding@resend.dev`. It delivers only to the Resend account owner's address and is more likely to be filtered as spam.
- `magicworkshost.com` is registered in Resend but not yet verified. Its DNS records are listed in `docs/14-dashboard-handover.md`.
- The domain has DMARC `p=reject` (strict), so switch `EMAIL_FROM_ADDRESS` to an `@magicworkshost.com` sender only after Resend shows the domain as Verified.

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
  - Every page has a canonical URL on the site origin (`siteConfig.url`: `NEXT_PUBLIC_SITE_URL`, default `https://magicworkshost.vercel.app`; set it to `https://magicworkshost.com` at the DNS cutover).
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
| WordPress URLs served at the identical URL (200, no redirect) | 109 / 109 |
| WordPress URL variants (with/without slash) → 200 in ≤ 1 hop | 217 / 217 |
| Internal links that go through a redirect | 0 |
| Client-side navigation to rewritten URLs; failed prefetches | 9 / 9 pass; 0 failed of ~550 RSC requests |
| Crawled pages returning 200 (sitemap plus discovered links) | 121 / 121, with 0 missing from the sitemap |
| OG and Twitter image coverage | 121 / 121 |
| JSON-LD blocks that fail to parse | 0 |
| Pages by schema type | BreadcrumbList 120, BlogPosting 50, FAQPage 29, HowTo 24, Product 18, Organization/LocalBusiness/WebSite on the home page |
| Checkout links | 24 cart links (23 pids), 0 invalid pids, 0 mock `/order` links |
| Login links | all point to `www.magicworkshost.com/clients/clientarea.php` |
| Responsive checks (121 pages × 390 / 768 / 1440 px = 363) | 0 horizontal overflow, 0 console errors, 0 nav mismatches |
| CSP violations (home, product, contact, blog) | 0 |
| Public forms, real browser (lead, quote, dialog, newsletter + validation, domain and site search) | 10 / 10 pass; each submission saved in Supabase and delivered to abhimagicsquad@gmail.com (Resend status `delivered`) |
| Dashboard (20 checks) | Current credentials sign in to the dashboard, and all sections load. Wrong password, signed-out access and cross-origin action requests are refused. Cookie flags are correct |
| Contact details | +91 9764746633 and sales@magicworkshost.com on every page (header, footer, contact page, schema); 0 pages with the old number or a Gmail address |
| Testimonials | The 4 WordPress testimonials (with photos) show on `/`, `/web-hosting-cart/` and `/vps-hosting/`; 0 pages with invented testimonials |

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
