# MagicWorksHost.com — Forensic Website Audit Report

**Audited URL:** https://magicworkshost.com/
**Business:** MagicWorks IT Solutions Pvt. Ltd. — web hosting reseller (shared/VPS/dedicated hosting, domains, SSL, business email), operating since 2012, based in Bavdhan, Pune, India.
**Audit date:** 2026-08-05
**Purpose:** Forensic source-of-truth for a full rebuild in Next.js (App Router) + TypeScript + Tailwind + Shadcn UI + Sanity CMS + Vercel.

> **Note on methodology:** This audit was performed via automated HTTP/HTML fetch and raw source/CSS inspection (no headless browser/DevTools session was available in this environment). Two things could **not** be confirmed with certainty and are flagged inline: (1) exact field-level markup of the Contact Us and Become-an-Affiliate forms (Contact Form 7 renders some structure client-side), and (2) live Core Web Vitals/Lighthouse scores (Google PageSpeed Insights API was rate-limited without an API key). Both are called out with a recommended manual verification step before Sanity schema/build lock-in.

---

## 1. Technology Stack (Reverse-Engineered)

| Layer | Finding | Evidence |
|---|---|---|
| CMS | WordPress | `wp-json` link header, `/wp-content/`, `/wp-admin/` paths, Yoast sitemap generator comment |
| Page Builder | **WPBakery Page Builder** (formerly Visual Composer) v8.2 | `<meta name="generator" content="Powered by WPBakery Page Builder...">` on every page; body class `wpb-js-composer js-comp-ver-8.2 vc_responsive`; pervasive `vc_row`/`vc_col-sm-*`/`wpb_wrapper` classes. **No Elementor markup found anywhere.** |
| Theme | **Impreza** (UpSolution "US Theme" framework) v8.33.2, child theme active | body class `Impreza_8.33.2 us-core_8.33.2`; `/wp-content/themes/Impreza-child/style.css` |
| SEO Plugin | Yoast SEO | `sitemap_index.xml` generator comment, `wordpress-seo/css/main-sitemap.xsl` |
| Forms | **Contact Form 7** | `wpcf7-form`, `_wpcf7` hidden fields, form IDs 8704 (Contact Us) and 9149 (sitewide quick-contact, reused on Home + Buy Web Hosting) |
| Spam protection | reCAPTCHA v3 | site key `6LdI4A4aAAAAAEQwfpIZ2sJp_8PYy3UIdYHYZl_Z` wired into CF7 |
| Caching/Perf | **LiteSpeed Cache 7.8.0.1** | HTML comments `<!-- Page cached/optimized by LiteSpeed Cache -->`; CSS/JS combined+minified to hashed bundles under `/wp-content/litespeed/{css,js}/`; third-party scripts proxied via LiteSpeed's "load JS from local" feature |
| Analytics | Google Ads conversion tag (`gtag/js?id=AW-828608021`) — **no separate GA4 property found** | |
| Session/UX analytics | Microsoft Clarity, project ID `r8jorr5igt` | |
| Live chat | Tidio (`code.tidio.co/o2obplaekvmzdvqn1m9yeirzgnt5nhxs.js`) | |
| Not found | No Facebook Pixel, no Hotjar, no Tawk.to, no GTM container, no visible WHOIS/domain-search AJAX widget | Checked across 5+ pages incl. the page literally named "domain-name-search-landing-page" |
| Slider/carousel | Owl Carousel (trust-logo strips) — no Swiper/Slick found | |
| Icons | Font Awesome (CDN v6.7.2 loaded via `use.fontawesome.com`, **and** a self-hosted FA5 Free+Brands `@font-face` set in the theme's own CSS — two FA versions coexist) | |
| Fonts | Headings: **Roboto**; Body: **Open Sans** (Google Fonts) | confirmed via theme `--h1-font-family`/`--font-family` CSS vars |
| Commerce/Billing | **External WHMCS** instance at `/clients/` — pricing pages are static deep links to `cart.php?a=add&pid=X&promocode=Y&billingcycle=Z`, not an in-WordPress cart. Client login/support/tickets/knowledgebase all live under `/clients/`. | |

**Migration implication:** This is a textbook page-builder WordPress site (not custom-coded). Content/marketing pages decompose cleanly into structured Sanity content blocks (moderate effort). Commerce is low-risk to port because it's just static outbound links to WHMCS — the rebuild only needs to preserve exact `pid`/`promocode`/`billingcycle` query parameters (or map to updated WHMCS product IDs). Highest-effort areas: (1) CF7 forms → Next.js form handling + reCAPTCHA v3 + email routing, (2) matching LiteSpeed's aggressive caching/CDN performance with Vercel's edge caching + ISR, (3) reproducing the two chat/analytics widgets (Tidio, Clarity) as Next.js third-party script loads.

---

## 2. Complete Sitemap / Page Inventory

Total public URLs discovered: **51 pages + 42 blog posts + 15 category archives + 1 blog index = 109 URLs.**

### 2.1 Core Pages
| URL | Type | Last Modified |
|---|---|---|
| `/` | Homepage | 2025-12-02 |
| `/about-us-website-hosting-services/` | Company | 2025-11-28 |
| `/contact-us/` | Contact (form) | 2025-12-01 |
| `/support/` | Support hub | 2025-12-03 |
| `/become-our-affiliate/` | Affiliate signup (form) | 2025-11-28 |
| `/resources/` | Blog hub alias | 2020-09-17 |
| `/sitemap/` | Human-readable sitemap | 2020-09-19 |
| `/blog/` | Blog index | 2021-11-25 |
| `/compare-hosting-plans/` | Pricing comparison | 2025-12-01 |
| `/50-off/` | Promo landing page | 2025-11-28 |
| `/web-hosting-cart/` | Shared-hosting pricing (cart-adjacent) | 2021-07-07 |
| `/migration-status/` | **Orphaned/placeholder — flagged, see §2.6** | 2024-04-17 |

### 2.2 Hosting Product Pages (template family A)
`/buy-web-hosting/` · `/unlimited-web-hosting-plans/` · `/seo-hosting/` · `/wordpress-hosting/` · `/linux-shared-hosting/` · `/vps-hosting/` · `/dedicated-server-hosting/` · `/linux-dedicated-server-hosting/` · `/managed-dedicated-hosting-services/` · `/cheap-fast-reliable-seo-friendly-usa-web-hosting/`

### 2.3 Domain Pages (template family B)
`/domain-hosting/` · `/domain-name-search-landing-page/` · `/domain-registration-india/` · `/domain-name-registration/` · `/buy-domain-name-at-cheap-price/` · `/transfer-your-domain-name/` · `/renew-your-domain/`

### 2.4 SSL Pages (template family C)
`/buy-ssl-certificate/` (pillar) · `/business-validated-certificates/` · `/domain-validated-certificate-with-sni-feature/` · `/domain-validated-certificates/` · `/extended-validated-certificates/` · `/wild-card-certificates/`

### 2.5 Email Pages (template family D)
`/business-email-hosting/` · `/enterprise-email-hosting/`

### 2.6 Utility / Landing / Status Pages
- Calculators: `/web-hosting-bandwidth-calculator/` · `/data-unit-calculator/` · `/download-upload-time-calculator/`
- Thank-you pages: `/thank-you/` · `/thank-you-for-subscribing/` · `/thank-you-for-interest-in-affiliate-program/`
- **`/migration-status/`** — fetch returned only generic homepage/nav content with no unique tracking UI. Likely a dead/orphaned route (possibly a leftover from the site's *own* prior migration). **Recommend manual browser check; do not port as-is.**

### 2.7 Legal Pages (one shared template)
`/privacy-policy/` · `/mail-policy/` · `/acceptable-use-policy/` · `/resource-abuse-policy/` · `/terms-of-services/` · `/service-level-agreement/` · `/affiliate-programme-terms/`
— Plain numbered-section legal body, no "last updated" date on any of them.

### 2.8 Blog
- Index: `/blog/` (also aliased at `/resources/`)
- 42 posts (2020–2021 publication dates; content stale relative to 2026, all evergreen hosting-education topics — see full list in Appendix A of the raw sitemap fetch)
- 15 category archives: affiliate-marketing, blogging, dedicated-hosting, digital-marketing, domain-name, email-hosting, online-business, secure-socket-layer-ssl, secure-web-hosting, shared-web-hosting-service, ssl-certificate, web-designs, web-development, web-hosting, web-security

### 2.9 robots.txt / XML Sitemap
- `Sitemap: https://magicworkshost.com/sitemap_index.xml` → 3 sub-sitemaps (post, page, category), Yoast-generated.
- Disallows: `/wp-admin/` (allows `admin-ajax.php`), `/clients/cart.php` variants for 21 product IDs, `/clients/domainchecker.php` + bulk variants, several Knowledgebase categories, `/clients/announcements.php`, `/discount/`.
- No `Crawl-delay`, no extra user-agent blocks.

---

## 3. Header Analysis

**Top utility bar** (dark `#2a363f` background): phone `+91 9764746633`, Support/Login links (→ WHMCS client area), social icons (Facebook, LinkedIn, Instagram).

**Main nav bar** (white background):
- HOME
- DOMAIN ▾ — Domain Name Registration, Indian Domain, Domain Hosting, Buy Domain Name, Transfer Domain
- HOSTING ▾ — SEO Hosting, Unlimited Hosting, Dedicated Servers, Buy Web Hosting, Compare Plans, Linux Dedicated Server, Linux Hosting, VPS Hosting, Managed Dedicated Server, WordPress Hosting
- SSL (no dropdown — direct link to `/buy-ssl-certificate/`)
- EMAIL ▾ — Business Email Hosting, Enterprise Email Hosting
- RESOURCES ▾ — Blogs
- KNOWLEDGEBASE (external → WHMCS KB)
- ABOUT
- CONTACT

No mega-menu (dropdowns are simple single-column lists, not multi-column with imagery). Mobile menu behavior and true sticky-header CSS could not be confirmed from the cached stylesheet (likely a separate JS module) — **verify sticky/mobile behavior manually before finalizing the header component spec.**

---

## 4. Hero Section Analysis (Homepage)

- **H1:** "Hosting That Perform 10X Faster With" (Magicworks Host, implied brand continuation)
- **Subheading:** "Your trust and website are at the right place"
- **Feature bullet list (7 items):** 10X fast website · One-click script installs · Intuitive control panel · JS/CSS compression – faster loading · Static content – 5x faster · Dynamic file – 10x faster · PHP up to 3x faster than Apache
- **CTAs:** "Choose Right Hosting Plan" (anchor scroll to pricing) and "Yes, I Want Such Web Hosting" (anchor scroll)
- **Trust/stat elements:** none in the hero itself — stats appear in the next section (load-time before/after comparison), not the hero
- **Media:** hero appears to use illustration/mascot imagery rather than photography or video (consistent across product pages)
- **Forms:** none in hero

Hierarchy pattern is consistent across product-family pages: H1 pain-point headline → feature bullets → dual CTA → (next section) quantified proof point.

---

## 5. Section-by-Section Inventory (by template family)

### 5.1 Homepage
1. Hero (see §4)
2. **Speed proof section** — "Does Your Website Load in Less Than 3 Seconds? Web Hosting Speed = Revenue" — before/after comparison (8.6s "Poor Traffic" vs 0.7s "1000% Increment in Traffic") — CTA "I Want This Speed"
3. **Pricing grid** — "Select Magicworks Host Web Hosting Packages" — 6-tier NVMe table (see §5.2 for full spec, shared across pages)
4. **Why Choose Us** — 6 feature tiles: Easy To Manage (cPanel), Email Accounts, cPanel, 150+ Scripts (Softaculous), Quick Loading, Unlimited MySQL Databases
5. **Testimonials** — 4 named customers with photos/titles/companies
6. **Trusted Customers** — 9-logo strip (Owl Carousel)
7. **Expert consultation CTA banner** — phone + email
8. Footer (see §7)

### 5.2 Hosting Plan Pages (Family A) — shared pricing table spec
6-tier NVMe grid used on Home, `/buy-web-hosting/`, `/unlimited-web-hosting-plans/`, `/seo-hosting/`, `/wordpress-hosting/`, `/linux-shared-hosting/`, `/domain-hosting/`, `/compare-hosting-plans/`, `/web-hosting-cart/`, `/50-off/` (discounted variant):

| Plan | Monthly (regular) | 1 Yr | 2 Yr | 3 Yr | Storage | Bandwidth | Emails |
|---|---|---|---|---|---|---|---|
| STARTER NVMe | ₹145 (₹194) | ₹2,124 (15% off) | ₹3,798 (24%) | ₹5,229 (30%) | 1GB NVMe | 5GB | 10 |
| BASIC NVMe | ₹291 (₹387) | ₹4,249 | ₹7,598 | ₹10,460 | 10GB | 10GB | 20 |
| BASIC PLUS NVMe | ₹407 (₹542) | ₹5,949 | ₹10,638 | ₹14,645 | 50GB | 20GB | 30 |
| ECONOMY NVMe | ₹639 (₹852) | ₹9,349 | ₹16,718 | ₹23,015 | 100GB | 30GB | 100 |
| DELUXE NVMe | ₹814 (₹1,085) | ₹11,899 | ₹21,278 | ₹29,293 | 150GB | 50GB | 100 |
| UNLIMITED NVMe | ₹1,162 (₹1,550) | ₹16,999 | ₹30,398 | ₹41,848 | 200GB | 200GB | Unlimited |

All plans: 4GB RAM, 2 vCPU, Free SSL, cPanel, Free JetBackup, ≥1 FTP. Each "Buy Now" → `/clients/cart.php?a=add&pid={153-158}&promocode={MWHANNUALSSD|MWHBIANNUALSSD|MWHTRIEANNUALSSD}&billingcycle={annually|biennially|triennially}&skipconfig=1`.

**Per-family-member deviations:**
- `seo-hosting`: tabbed features, ranking-speed comparison graphic, SEO-specific FAQ (6 Q&A)
- `wordpress-hosting`: WP-specific FAQ (6 Q&A), no comparison table
- `linux-shared-hosting`: 4-tab feature block (Specs/OS/Security/Management) + Softaculous one-click CMS row; 4-Q FAQ
- `cheap-fast-reliable-seo-friendly-usa-web-hosting`: **content bug** — hero H1 is a copy-paste leftover from the SEO hosting page. Pricing is a distinct cheaper USA-hosted SKU family (USA STARTER ₹42/mo → USA UNLIMITED ₹167/mo), separate `pid`/promocode set (`MWHANNUALUSA`) — **not** the NVMe grid. Needs product-data reconciliation before Sanity content entry.
- `compare-hosting-plans`: despite the name, has **no actual competitor comparison data** — just the same NVMe grid re-labeled "Compare Magic Host Plans and Market Plans." Recommend building a *real* comparison table in the rebuild if this feature is wanted, or renaming/repurposing the route.
- `50-off`: same grid at a flatter "50-70% off" framing (Starter ₹62/mo → Unlimited ₹349/mo), no countdown timer (urgency is copy-only).

**VPS / Dedicated pages (Family A2)** — India vs USA data-center pricing tables side by side, monthly-only billing, flat "20% discount" badge:
- VPS: STARTER/BASIC/SILVER — India ₹4,372–₹6,712/mo, USA ₹3,982–₹5,776/mo
- Dedicated Server Hosting **and** Managed Dedicated Hosting Services are **functionally identical pages** (same 4 tiers STARTER/BASIC/SILVER/GOLD, same pids, same prices ₹13,769–₹25,469 India / ₹12,989–₹21,569 USA, same FAQ) — only hero copy differs. **Recommend merging into a single Sanity document type with a `managed: boolean` flag** rather than duplicating content, to eliminate this content-debt pattern in the rebuild.
- Linux Dedicated Server Hosting reuses the same pricing table again with different testimonials.

### 5.3 Domain Pages (Family B)
Shared structure: Hero (unique H1 per page) → TLD price strip (**.com ₹1,099 | .in ₹699 | .co.in ₹649 | .org ₹1,418**; transfer page shows .com at ₹899) → "With Every Domain You Get" 6-feature block (Easy Account Management, Theft Protection, Domain Forwarding, Auto Renewal, Domain Masking, Domain Lock) → 6-icon advantages → NVMe hosting grid re-inserted → testimonials → trust-logo strip → FAQ → footer.

**Critical finding:** No WHOIS/domain-availability search widget exists anywhere on the site, **including** the page literally named `/domain-name-search-landing-page/` — confirmed via two independent fetches specifically hunting for input fields/search forms/iframes. This is either a JS-only client-side feature invisible to fetch tooling, or a feature that was never built/has been removed. **Flag for manual browser verification — this affects scope: if a live domain search needs to exist in the Next.js rebuild, it requires new integration (e.g., a registrar API), not a port of existing functionality.**

- `transfer-your-domain-name`: transfer-specific FAQ (duration 1-7 days, pre-transfer checklist: disable privacy, verify admin email, remove locks, obtain EPP/auth code); no actual transfer form (domain + EPP code inputs).
- `renew-your-domain`: defers entirely to WHMCS client-area login rather than a public renewal lookup form.

### 5.4 SSL Pages (Family C)
`/buy-ssl-certificate/` (pillar/hub) has a real 4-row comparison pricing table: Domain Validated ₹4,000/yr · Business-Validated ₹9,000/yr · Wild Card ₹16,000/yr · Extended-Validated ₹25,000/yr, plus "Why SSL Matters" block, SSL-vs-no-SSL visual, 3-step how-it-works, 3-step install guide, 6-Q FAQ.

**Content bug found:** The 5 individual certificate sub-pages (business-validated, domain-validated ×2, extended-validated, wild-card) are near-duplicate content that **all display the same flat price (₹5,000/yr + ₹460/mo dedicated-IP add-on)** regardless of certificate tier, instead of the differentiated ₹4,000/₹9,000/₹16,000/₹25,000 pricing shown on the hub page. **This pricing data must be reconciled against the live WHMCS backend before entering it into Sanity** — do not blindly copy the current live text.

### 5.5 Email Pages (Family D)
Single-SKU pages (not multi-tier despite "plan" framing):
- Business Email: OX Business Email, ₹45/mo per mailbox, 1 account/5GB, `pid=34`
- Enterprise Email: ₹99/mo per mailbox, 25GB + 5GB file storage, collaboration tools, `pid=80`
No FAQ, no comparison table, no forms on either.

### 5.6 Company / Support / Legal / Utility Pages
- **About Us:** company credibility page — "About Magic Works Host" (division of MagicWorks IT Solutions, since 2012), "manage everything with single click" pitch, 24/7 call banner, mascot illustration + infographic + payment-method logos.
- **Contact Us:** "Get the best web Hosting services..." → "Let Us Connect" (CF7 form, ID 8704) → "Find Us at" address block → 24/7 banner. Confirmed contact details: phone +91 9764746633, email sales@magicworkshost.com, address "#201, Vasant Bahawa, Survey No. 20, Near La Valle Casa, Bavdhan, Pune, Maharashtra – 411021"; hours: Sales Mon–Sat 9:30–6:30 IST, Accounting Mon–Fri 9:30–6:30 IST, Support 24/7. No map embed detected. Submission → `/thank-you/`.
- **Support:** "Give us a Call" → "Create & View Tickets" → "Browse KnowledgeBase" → Pre-Sales contact form → 24/7 banner. Channels: phone, WHMCS ticket system, KB, pre-sales form, WhatsApp. No live chat widget referenced in-page (Tidio loads sitewide via script instead).
- **Become Our Affiliate:** Hero → "Why MagicworksHost" (4 tiles) → **interactive earnings calculator** ("Estimate your Earnings") → "Your Passive Income in 1 Year" projection example → "How to Become an Affiliate" → testimonials → FAQ. Commission: 20% recurring, ₹2,000 min withdrawal, 90-day cookie, <7% churn claim. Form → `/thank-you-for-interest-in-affiliate-program/`.
- **Resources:** blog-hub alias — 9 article cards, search bar, sidebar (15 categories + Recent Posts).
- **Sitemap (HTML):** authoritative human IA reference grouped by Domain / Hosting / Email / SSL / Legal / Support.
- **Calculators** (pure client-side JS widgets, straightforward React ports):
  - *Bandwidth Calculator:* inputs = avg page size (MB), avg monthly visitors, avg pages/visit → output GB/month
  - *Data Unit Calculator:* value + unit dropdown (Bytes/Kb/Mb/Gb) → converted value
  - *Download/Upload Time Calculator:* file size (value+unit) + internet speed (value+unit) → transfer duration
- **Legal pages** (Privacy, Mail Policy, AUP, Resource Abuse, ToS, SLA, Affiliate Terms): one shared plain-text numbered-section template, no revision dates. ToS references third-party agreements (HostDime, ResellerClub, ICANN, SiteLock, CodeGuard). SLA includes a downtime-to-credit table, 99.9% uptime commitment, Pune/Maharashtra governing law.
- **Thank-you pages:** one shared minimal template (logo, single heading, one-line confirmation, phone CTA) reused for subscribe/affiliate/contact confirmations.

### 5.7 Blog
- **Index (`/blog/`):** vertical list, 8 posts/page, **numbered pagination**. Card = thumbnail, title, date, author, category, comment count, excerpt, "Read More." Sidebar: search, categories (15), recent posts (5).
- **Category archive:** same card format but uses **"Load More" infinite scroll** instead of numbered pagination — **inconsistency flagged; pick one pattern for the rebuild.**
- **Single post:** featured image w/ title overlay, byline (author, relative date), category tag, H2/H3-structured body, internal service links, social share row (Email/FB/Twitter/LinkedIn/Pinterest/VK), comments form, prev/next nav, sidebar, footer CTA. Older posts inconsistently omit byline/share/comments — a data-completeness issue, not a second template.

---

## 6. Footer Analysis

Three-tier structure: header/content area → **Footer** (`#2a363f`) → **Sub-footer/copyright bar** (`#1c2329`, darkest).

**Footer columns:**
- Legal Policies: Privacy Policy, Mail Policy, Resource Abuse Policy, Acceptable Use Policy, Terms of Services, Service Level Agreement, Affiliate Programme Terms
- Web Hosting Plans: SEO Hosting, Linux Hosting, Unlimited Hosting, Buy Web Hosting, Dedicated Servers, Managed Dedicated Servers
- Support: Knowledgebase, Support, Sitemap, Contact Us, Become Our Affiliate
- Contact block: address, phone, email
- Social icons: Facebook, Twitter, LinkedIn, Instagram

**Copyright bar:** "© 2012-2025 – MagicWorksHost.com | Web Development by MagicWorks"

No newsletter signup form was confirmed in the footer itself (the "thank-you-for-subscribing" page implies a newsletter form exists somewhere — likely a widget elsewhere on blog pages; **verify placement manually**). No trust badges (payment/security seals) confirmed in footer — payment-method logos were observed on the About page instead.

---

## 7. Form Inventory

| Form | Location | Plugin | Fields (confirmed or expected) | Submission Behavior |
|---|---|---|---|---|
| Quick Contact (sitewide) | Home, Buy Web Hosting (form ID 9149) | Contact Form 7 + reCAPTCHA v3 | **Unconfirmed exact fields** — expect Name/Email/Phone/Message per CF7 convention. Needs manual DevTools check. | Unknown — likely inline AJAX success message (CF7 default) |
| Contact Us form | `/contact-us/` (form ID 8704) | Contact Form 7 + reCAPTCHA v3 | **Unconfirmed exact fields** | Redirects/links to `/thank-you/` |
| Affiliate signup | `/become-our-affiliate/` (`#join-now` anchor) | Likely CF7 (unconfirmed) | **Unconfirmed exact fields** | → `/thank-you-for-interest-in-affiliate-program/` |
| Newsletter signup | Location unconfirmed (implied by thank-you page) | Unknown | Likely email-only field | → `/thank-you-for-subscribing/` |
| Blog comment form | Every single post | WordPress native comments | Name, Email, Website (optional), Comment | Standard WP comment moderation flow |

**Action required before Sanity/Next.js form schema is finalized:** open each form in a real browser and inspect the DOM/network tab to confirm exact field names, types, and required/optional status. This is the single biggest "unknown" left by this audit.

**Reusable form architecture recommendation:** Build one `<LeadForm>` component (React Hook Form + Zod) parameterized by a `formType` prop (`contact | affiliate | newsletter | pre-sales`), backed by a single Next.js Route Handler that sends via a transactional email provider (e.g. Resend) to the new contact email, with reCAPTCHA v3 (or a modern equivalent like Cloudflare Turnstile) and a shared `/thank-you` route that varies its message by query param instead of duplicating four near-identical WordPress pages.

---

## 8. SEO Audit

Confirmed via head-tag/JSON-LD inspection of Home, VPS, Domain Registration, Contact, a sample blog post, and About.

| Page | Title (len) | Meta Description (len) | JSON-LD | Notable Issue |
|---|---|---|---|---|
| Home | "Hosting \| Website Hosting \| MagicworksHost Services" (51) | 136 chars | `Corporation` | — |
| VPS Hosting | "VPS Hosting \| linux vps hosting \| MagicWorks Host" (49) | 133 chars | `Product`+`Offer` (₹106 price — looks like a stale/placeholder figure, not the real ₹4,372+ tiers) | `og:type=article` on a product page (should be `product`/`website`) |
| Domain Registration | "Domain registration \| Check Domain Name Availability" (52) | 140 chars | `Product`+`Offer` (same ₹106 placeholder) | Same og:type mismatch |
| Contact Us | "Best Web Hosting \| Buy Domain Hosting \| MagicWorks Host" (55) | 139 chars | `Corporation` (name: "Contact") | **Title/description unrelated to page content** — describes the whole business, not contact info |
| Blog post (`what-is-web-hosting`) | 68 chars | 147 chars | `BlogPosting` | **`publisher.name` is the literal placeholder string `"Organisation"`** — data bug; no `BreadcrumbList` |
| About Us | "Website Hosting \| MagicWork Host \| Hosting provider" (51) | 136 chars | `Corporation` (name: "About") | **Meta description is a verbatim duplicate of the homepage's** |

**Sitewide findings:**
- Every page has exactly one H1, no skipped heading levels — structurally sound.
- Weak point: plan/feature card labels and repeated footer column titles ("WEB HOSTING PLANS", "SUPPORT") are marked up as **H4**, diluting per-page heading uniqueness/relevance; recommend H3 for cards, non-heading `<nav aria-label>` for footer link groups.
- No `robots` meta tag anywhere (defaults to indexable — fine, but should be explicit and CMS-controlled going forward).
- Schema in use: `Corporation` (misused in place of proper `Organization`), `Product`+`Offer` (hosting/domain pages, with what appears to be stale placeholder pricing), `BlogPosting`. **Missing entirely:** `WebSite`+`SearchAction`, `BreadcrumbList` (no breadcrumb schema anywhere), `FAQPage` (despite genuine, substantial FAQ content on VPS/domain/hosting pages).
- Internal linking: every page links to `/vps-hosting/`, `/domain-name-registration/`, `/contact-us/`, and the WHMCS cart/client-area 18–24 times (nav + repeated plan CTAs). Blog/content pages do not link directly to cart — funnel runs blog → product page → cart, which is reasonable but means blog content contributes no direct conversion links.
- `robots.txt` and XML sitemaps are otherwise clean (Yoast-generated, no crawl-delay, no anomalies).

**Recommendations for the rebuild** (implement via `next/metadata` + a shared JSON-LD component driven by Sanity fields):
1. One canonical `Organization` schema site-wide (fix the "Corporation"/"Organisation" placeholder bugs), plus `WebSite`+`SearchAction` on the homepage.
2. `BreadcrumbList` on every page below the homepage.
3. `FAQPage` schema wrapping existing FAQ accordions on hosting/domain/SSL pages.
4. `Product`+`AggregateOffer` on hosting/VPS/dedicated/SSL/email pages with **real, reconciled pricing** (not the stale ₹106 placeholder or the SSL flat-₹5,000 bug).
5. Correct `og:type` per page type (`website`/`product`, `article` reserved for blog).
6. Add `article:published_time`/`modified_time` on blog posts, plus visible "last updated" dates on legal pages.
7. CMS-level validation rule to prevent duplicate meta descriptions across documents (catches the About/Home duplicate bug from recurring).

---

## 9. Performance Audit

Live Lighthouse/PageSpeed Insights data could not be pulled in this environment (Google's public API endpoint returned HTTP 429 without a key). The assessment below is a **heuristic audit based on confirmed stack composition** — a manual Lighthouse/PSI run against the live site is recommended before setting Next.js performance budgets.

**Factors likely helping current performance:**
- LiteSpeed Cache full-page caching + CSS/JS combine-and-minify (confirmed active on every fetched page)
- LiteSpeed's "load JS from local" proxying of Google Fonts/GTM/reCAPTCHA reduces some third-party DNS/connection overhead

**Factors likely hurting current performance (all confirmed present):**
- WPBakery's row/column DOM structure is inherently markup-heavy (deeply nested `vc_row`/`vc_column_container`/`wpb_wrapper` divs) — large DOM size and CSS specificity chains.
- **Two Font Awesome installations coexist** (CDN v6.7.2 + self-hosted FA5 in the theme) — duplicate icon-font payload.
- Owl Carousel + jQuery dependency for trust-logo sliders (jQuery-based sliders carry more JS weight than a modern CSS/Intersection-Observer approach).
- Three third-party scripts execute on every page regardless of need: Tidio chat widget, Microsoft Clarity, Google Ads gtag — each adds a separate connection + script parse cost.
- reCAPTCHA v3 script loads sitewide (via the reused quick-contact form on Home) even on pages without a visible form.
- No evidence of modern image formats (WebP/AVIF) or responsive `srcset` in the fetched markup — WordPress/Impreza's default media handling is likely serving one size per image.
- 594KB minified combined stylesheet observed for a single asset bundle — large for CSS alone before gzip.

**Next.js/Vercel optimization opportunities (concrete, mapped to findings):**
1. Replace Owl Carousel/jQuery with a lightweight CSS-scroll-snap or Embla-based carousel — removes jQuery entirely.
2. Single icon system: migrate to **Lucide Icons** (per project spec) and drop both Font Awesome installations.
3. `next/image` for all imagery with automatic AVIF/WebP + responsive `srcset` — direct fix for the missing-modern-formats gap.
4. `next/script` with `strategy="lazyOnload"` or `worker` for Tidio/Clarity/gtag so they don't block initial render; consider loading Tidio only after user interaction (scroll/idle) rather than on every page load.
5. Load reCAPTCHA (or Cloudflare Turnstile) only on pages that actually render a form, not sitewide.
6. Tailwind's generated CSS + PurgeCSS-by-default will structurally prevent the 594KB-monolithic-stylesheet problem by construction (component-scoped utility classes, tree-shaken at build).
7. Use ISR (`revalidate`) or static generation for all content pages (blog, legal, product pages change rarely) — matches LiteSpeed's full-page-cache behavior but at the edge via Vercel, with no cache-invalidation plugin dependency.
8. Static-export the three calculator widgets as client components (`"use client"`) with no server round-trip — they're pure arithmetic.

**Action item:** run Lighthouse (mobile + desktop) and WebPageTest against the live site to capture actual LCP/CLS/INP/TBT/byte-weight numbers as a pre-migration baseline, then set matching or better budgets for the Next.js build (suggested target: LCP < 2.0s, CLS < 0.05, INP < 200ms, JS payload < 150KB gzipped per route).

---

## 10. Design System Extraction

Extracted from the theme's raw combined stylesheet (`/wp-content/litespeed/css/...css`), which exposes CSS custom properties — most tokens below are **confirmed-from-source**.

### Colors
| Token | Hex | Usage |
|---|---|---|
| Heading/dark ink | `#2a363f` | H1–H6, header-top bg, footer bg |
| **Primary accent (orange)** | `#ff6600` | CTA text/links, hover states |
| Body text | `#727272` | paragraph copy |
| Secondary text | `#999999` | footer text, muted copy |
| Background white | `#ffffff` | page/header-middle bg |
| Background alt | `#f5f5f5` | section alternation, `theme-color` meta |
| Border | `#e8e8e8` (alt `#dddddd`) | card/content dividers |
| Footer bg | `#2a363f` | |
| Sub-footer (darkest) | `#1c2329` | copyright bar |
| **Pricing CTA (cyan-blue gradient)** | base `#019ad2` → `#33bcef`, hover `#0271bf` → `#2daddc` | "Buy Now" buttons specifically — a *second*, distinct accent from the orange used elsewhere |
| WhatsApp green | `#25d366` | sticky WhatsApp button |

No formal red/warning token exists in source. Recommend the Tailwind config define: `brand.orange` (#ff6600) as primary, `brand.navy` (#2a363f) as dark/ink, a new semantic `success`/`warning`/`danger` triad (currently absent), and keep the cyan-blue as a distinct `cta-secondary` token for pricing buttons specifically, matching current user expectations around "buy" buttons.

### Typography
- Headings: **Roboto**, weights 700 (H1/H2), 500 (H3-H5), 400 (H6)
- Body: **Open Sans**, regular
- Sizes (desktop/compact pairs): H1 24/27px, H2 30/34px, H3 18/21px, H4 18px, H5 1.4rem, H6 1.2rem, body 16px

### Buttons
- Primary pill CTA: fully rounded (`border-radius: 5em`), solid brand-gradient fill, white text, padding `.7em 1.2em`
- Pricing "Buy Now": rectangular/slightly rounded, 1px border + vertical gradient fill (cyan-blue), darkens on hover
- No unified radius scale in current CSS (values range from 2px to 100px/pill/circle) — **standardize to Tailwind `rounded-md` (default) / `rounded-full` (pills/badges) in the rebuild.**

### Cards / Elevation
- Soft shadow: `0 5px 15px rgb(0 0 0 / .08)` and `0 .3em .8em rgb(0 0 0 / .08)` — subtle, low-opacity
- Border color `#e8e8e8` for card/content boundaries
- Pricing-card-specific markup/styling lives outside the cached bundle (likely a plugin asset) — **needs manual visual reference capture (screenshot) before rebuilding pricing cards pixel-for-pixel.**

### Layout / Breakpoints
Observed breakpoints: 480, 600/601, 641, 700, 767, 782, 899/900, 1023/1024/1025, 1280, 1380/1381px — maps cleanly onto Tailwind's `sm(640)/md(768)/lg(1024)/xl(1280)` scale. Container max-widths observed: 1024px, 1280px, 1380px.

### Iconography
Font Awesome (both CDN v6.7.2 and self-hosted FA5) — solid/filled style predominant for UI glyphs (phone, checkmarks, arrows), brand icons for socials. **Rebuild uses Lucide Icons per project spec — treat this as a full icon-set swap, not a port**, and use it as an opportunity to consolidate to one consistent icon weight/style (current site mixes two FA versions).

### Header/Footer Structure
Two-row header (dark utility bar `#2a363f` + white logo/nav bar `#ffffff`); three-tier footer (content → footer `#2a363f` → sub-footer `#1c2329`). Sticky-header behavior not confirmed in the cached CSS (likely separate JS) — verify manually.

**Not recoverable from automated fetch (need manual screenshot capture before pixel-level rebuild):** hero background treatment/gradients/decorative shapes, exact pricing-card markup and badge styling, contact-form field styling, mobile menu open/close animation.

---

## 11. Image & Asset Audit

Automated fetch could not enumerate a full binary asset list (no directory listing / DAM available). Based on content observed across pages:

| Category | Observed | Notes |
|---|---|---|
| Logo | MagicWorksHost wordmark, header + footer | Need actual file export (SVG preferred) — not retrievable via HTML fetch alone |
| Icons | Font Awesome glyphs (see §10) | To be replaced with Lucide in rebuild — not asset files to migrate |
| Illustrations | Mascot/character illustrations on Homepage, About, 50-off promo | Likely custom-commissioned; **recommend exporting these directly from WordPress media library** rather than screen-scraping, to preserve quality |
| Trust/customer logos | 9 client logos (Thuse Electronics, Render, CCG, Kadkomp, Design Labs, Cyber, GRD, Lips India, Spectro Labs) | Used in Owl Carousel strip across most pages |
| Testimonial photos | Headshots for ~6-8 named customers (Vishal Bhatia, Prashant Karhade, Swapnil Mahajan, Asish Mukharji, Dr. Ravindra Kulkarni, Anand Kumar, Dr. Ravi Acharya, Raghav Khode, Uday Kulkarni, Joji George, Ashutosh Vadanagekar) | Reused across multiple product pages in different combinations |
| Payment-method logos | Observed on About page | Likely a standard payment-gateway badge strip |
| Blog featured images | One per post (42 posts) | Generic stock-style imagery per topic |
| Team photos | **None found** | This is a small reseller company site — no team/staff bio section exists anywhere in the crawled pages |

**Recommendation:** Before development starts, get direct WordPress media-library export access (via `wp-admin` or an FTP/SFTP pull of `/wp-content/uploads/`) rather than attempting to re-scrape images through HTML fetch — this guarantees original resolution/format for reprocessing through `next/image`.

---

## 12. Key Risks / Open Items Requiring Manual Verification

1. **Form field schemas** (Contact, Affiliate, Newsletter) — open in a real browser + DevTools before finalizing Zod schemas.
2. **`/migration-status/`** — confirm whether this route is dead/orphaned or serves a real purpose before deciding whether to port it.
3. **SSL sub-page pricing bug** — the 5 individual cert pages all show a flat ₹5,000 price that contradicts the ₹4,000/₹9,000/₹16,000/₹25,000 tiers on the hub page; get correct current pricing from the WHMCS backend, not the live page text.
4. **USA hosting SKU page** — has a copy-paste wrong H1 and an entirely separate, unverified pricing/pid/promocode set; reconcile before content entry.
5. **No live domain/WHOIS search widget found** despite a page named for it — confirm whether this is an intentional gap, a JS-only feature invisible to fetch, or scope to be newly built.
6. **Live Core Web Vitals baseline** — run Lighthouse/PSI manually; this audit's performance section is stack-inference only.
7. **Newsletter signup form location** — implied by a thank-you page but not located on any crawled page; find it before scoping the newsletter feature.
8. **Visual assets** (hero backgrounds, pricing card styling, mobile menu) — capture via screenshot/DevTools; not recoverable from static HTML/CSS fetch.
