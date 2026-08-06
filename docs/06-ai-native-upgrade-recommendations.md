# AI-Native Upgrade Recommendations

Improvements to layer in during the rebuild, preserving current branding/positioning. These are recommendations only — no redesign performed yet.

## UX & Conversion Flow
- **Fix the content-duplication bugs found in the audit as a conversion opportunity, not just cleanup**: the Dedicated vs. Managed-Dedicated pages and the 5 near-identical SSL pages currently give buyers no real reason to pick one tier over another. Differentiating them with honest, distinct copy and correct pricing (see audit §5.4/§5.2) will reduce purchase hesitation.
- **Add a real plan-comparison table** on `/compare-hosting-plans` (currently just a relabeled pricing grid) — a side-by-side feature matrix with a recommended-plan highlight, driven by the `hostingPlanSet` Sanity data so it never drifts from the pricing pages.
- **Persistent billing-cycle selector**: let a user pick 1yr/2yr/3yr once (e.g. via a `PricingContext`) and have it apply across every plan card and page they browse, instead of choosing per-card each time.
- **Resolve the domain-search gap**: either build a real WHOIS/availability-check widget (the page name promises one but none exists) or repurpose that route's messaging — leaving a "search" page with no search function is a credibility risk.
- **AI-assisted plan recommender**: a short 3-question quiz ("How many sites?", "Expected traffic?", "Technical comfort level?") that recommends a specific tier — turns six ambiguous pricing tiers into a guided decision, well-suited to an "AI-native" positioning.

## Performance
- All items in the audit's §9 Performance section (image formats, icon consolidation, script loading strategy, carousel library swap) directly translate to Core Web Vitals gains — treat that section as the performance backlog.
- Add a real Lighthouse CI budget check in the deployment pipeline so regressions are caught automatically, replacing the current lack of any visible performance monitoring.

## Accessibility
- Current site's heavy reliance on H4 for card labels and lack of `aria-label`s on icon-only buttons (WhatsApp FAB, social icons) should be corrected as part of the component rebuild — use semantic headings and Shadcn's built-in accessible primitives (Radix under the hood) rather than div-based custom widgets.
- Ensure the reCAPTCHA/Turnstile challenge and all three calculators are keyboard-navigable and screen-reader labeled — the current CF7 forms' accessibility could not be verified and should be audited once real field markup is confirmed.
- Color contrast check: the orange accent (`#ff6600`) on white background should be verified against WCAG AA for text use (likely fine for large CTA text, worth checking for smaller link text).

## SEO
- Implement everything flagged in audit §8: proper `Organization`/`WebSite`/`BreadcrumbList`/`FAQPage` JSON-LD, fixed `og:type` per page, unique meta descriptions enforced at the CMS level, and real (not placeholder) `Product`/`Offer` pricing schema.
- Add breadcrumbs as a visible UI element too (currently absent), which also aids navigation UX on deep pages like individual SSL certificate pages.
- Blog content is 4-5 years stale (2020-2021 posts) with no recent additions — an AI-assisted content refresh/republish cadence (updating evergreen posts with current pricing/screenshots and a visible "updated" date) would both help SEO freshness signals and fix the audit's finding that blog pages drive zero direct conversion links.

## Mobile Experience
- Live site's mobile menu/sticky-header behavior couldn't be confirmed from static fetch — treat the rebuild as a chance to guarantee a tested, smooth mobile nav (Shadcn `Sheet` drawer) and sticky CTA bar (phone/WhatsApp) on mobile product pages, since hosting purchases skew toward quick mobile research-then-desktop-purchase patterns.
- Calculators and the affiliate earnings estimator should be verified touch-friendly (large tap targets, numeric keyboard inputs on mobile) since they're currently unknown-quality WPBakery widgets.

## Trust & Credibility
- Testimonials are currently reused inconsistently across pages (per audit) — an editorial `usedOnPages` field (in the Sanity schema plan) lets the team assign real, page-relevant testimonials rather than the same handful everywhere.
- Add visible trust signals missing today: no security/payment badges were found in the footer (only on the About page) — surface these near every "Buy Now" button, where purchase-hesitation actually happens.
- Add "last updated" dates to legal pages (currently absent) — small trust signal, also a compliance best practice.
