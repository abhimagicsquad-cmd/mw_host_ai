# Development Roadmap

Execution sequence for the rebuild, sequenced so each phase produces a demoable increment.

## Phase 0 — Pre-Development Verification (blocking items from the audit)
Must resolve before schema/content lock-in:
- Manually inspect Contact Us, Quick Contact, and Affiliate forms in a real browser/DevTools to confirm exact fields.
- Confirm whether `/migration-status/` and the domain-search widget are real features or dead/missing.
- Pull correct, reconciled pricing for the 5 SSL sub-pages and the USA hosting page from the WHMCS backend.
- Get direct media-library/FTP export access for logo, illustrations, and testimonial photos (not screen-scraped).
- Run a manual Lighthouse/PSI pass on the live site for a real performance baseline.
- Locate the newsletter signup form referenced by its thank-you page.

## Phase 1 — Project Setup
- Initialize Next.js (App Router, TypeScript) with Tailwind, Shadcn UI, Framer Motion, React Hook Form + Zod.
- Set up Sanity Studio (embedded route), configure dataset, and implement schemas from `05-sanity-schema-plan.md`.
- Configure `siteSettings` singleton with new contact info (phone `8421903846`, email `abhimagicsquad@gmail.com`).
- Set up Vercel project, preview deployments, environment variables, and the Sanity webhook → `/api/revalidate` wiring.
- Implement `middleware.ts` redirect table seeded from `03-route-mapping.md`.

## Phase 2 — Global Components
- `MainHeader`, `TopBar`, `NavMenu`/`NavDropdown`, `MobileNav`, `Footer`, `WhatsAppFAB`.
- Design tokens into `tailwind.config.ts` from `01-website-audit-report.md` §10 (colors, type scale, breakpoints).
- Core Shadcn primitives installed and themed (Button, Card, Accordion, Tabs, Sheet, Input, Select).
- `JsonLd`, `BreadcrumbTrail`, `lib/seo.ts` metadata builders.
- `LeadForm` + `RecaptchaProvider`/Turnstile + `/api/forms` route handler.

## Phase 3 — Homepage
- `HeroSection`, `SpeedProofSection`, `PricingTable` + `PlanCard`, `FeatureGrid`, `TestimonialCarousel`, `TrustLogoCarousel`, `CTABanner`.
- Wire to `homePage` Sanity document; validate visually against live site.

## Phase 4 — Product Pages (Hosting / VPS / Dedicated / Domain / SSL / Email)
- Build `hostingPlanPage`, `dedicatedHostingPage`, `vpsHostingPage`, `domainPage`, `sslPage`, `emailHostingPage` templates using the shared `PricingTable`/`DualRegionPricingTable`/`SSLPricingTable`/`FAQAccordion` components.
- Populate `hostingPlanSet` shared pricing data once; verify every page referencing it renders correctly.
- Build the three `tools/` calculators as client components.
- Resolve Phase 0 open items (SSL pricing, USA hosting page, domain search) with real data before publishing these routes live.

## Phase 5 — Company, Support, Legal, Promo Pages
- About, Contact (with `LeadForm`), Support, Become Our Affiliate (with `AffiliateEarningsCalculator`), `legalPage` template (7 docs), `/thank-you` consolidated route, `promoPage` template (50-off).

## Phase 6 — Blog
- `blog` index + pagination (resolve numbered-vs-load-more inconsistency — pick numbered pagination for consistency and SEO-crawlability), single post template, category archive template.
- Migrate 42 posts' content into `blogPost` documents (content migration script or manual entry, author's call based on volume).
- `RelatedPostsRow`, `SocialShareRow`, author/category reference wiring.

## Phase 7 — SEO
- Implement `app/sitemap.ts`, `app/robots.ts`.
- Full JSON-LD rollout: `Organization`, `WebSite`+`SearchAction`, `BreadcrumbList` sitewide, `FAQPage` on all FAQ sections, `Product`+`Offer` with correct pricing.
- Fix `og:type` per page type; add `article:published_time` to blog.
- CMS validation rule for meta-description uniqueness.
- 301 redirect QA against the full `03-route-mapping.md` list.

## Phase 8 — Testing
- Cross-browser/responsive QA against every breakpoint identified in the audit (480/640/768/1024/1280).
- Form submission end-to-end tests (contact, affiliate, newsletter) including reCAPTCHA/Turnstile flow.
- Accessibility pass (axe/Lighthouse a11y) against the recommendations in `06-ai-native-upgrade-recommendations.md`.
- Performance budget verification (Lighthouse CI) against the baseline captured in Phase 0.
- Visual regression check of pricing tables/testimonials against live-site screenshots (since exact CSS for these wasn't recoverable from static fetch).

## Phase 9 — Deployment
- Production Vercel deployment, domain cutover plan (DNS), final redirect verification, Search Console re-submission of new sitemap, monitoring (Vercel Analytics + Microsoft Clarity carried over + Google Ads conversion tag re-implemented via `next/script`).
- Post-launch: 48-hour monitoring window for 404s/redirect gaps using server logs or Vercel's edge logs.
