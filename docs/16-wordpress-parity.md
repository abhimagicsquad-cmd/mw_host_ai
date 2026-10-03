# WordPress → Next.js feature parity

This doc tracks the page-by-page and feature-by-feature comparison against magicworkshost.com (the WordPress site, which is the source of truth). The comparison covered all 52 WordPress pages.

## Done

| Area | What the new site does now | Commit |
|---|---|---|
| Tracking | Google Ads (AW-828608021), Microsoft Clarity and Tidio chat use the WordPress IDs and load on the live domain only (`NEXT_PUBLIC_ANALYTICS=on\|off` overrides this). Ads conversions fire on the thank-you, newsletter and affiliate pages. | 68619d5 |
| Conversion | Floating WhatsApp and call buttons, the "Enquire Now" side tab (opens the lead form), the once-per-session auto popup, and all 7 legal links in the footer. | a08c5e9, 68619d5 |
| Plans and pricing | Plan cards have a billing-period picker: 1/2/3 years for shared hosting and 1/3/6/12 months for VPS, each with its WordPress promo code and WHMCS cart link. Plan data (specs, regular prices, 50-off plans, SSL and email features) matches WordPress. The compare table buys from the cart and lines up by slug. The Unlimited page sells only Unlimited NVMe. | eab0620 |
| CMS | Sanity is removed and the dashboard is the only content source. Pricing, compare rows, menus and settings were migrated and published. | c341c3b, c44ca4a |
| Domains | Every domain page has the live WHMCS search. The transfer page submits `domain=transfer`, shows transfer prices (.com ₹899) and has the six transfer notes. The renew page links to the client area ("Log in to renew"). Domain pages and the search page show the hosting plans. Hero buttons scroll to the search. Product/Offer JSON-LD covers TLD prices. | this phase |
| Trust | The "Trusted By" logo strip (the 9 WordPress logos) appears sitewide. The footer CTA shows phone and email ("Call our experts"). Testimonials appear on hosting, dedicated, domain, email, SSL, compare and promo pages. | this phase |
| Affiliate | Signup form (first name, last name, email, mobile) goes to `/api/leads` as `affiliate-programme`, then the affiliate thank-you page, which fires the conversion and has a "Complete affiliate registration" button (WHMCS `affiliates.php`). The page also shows the affiliate email and terms link. | this phase |
| Support and contact | Ticket links open `submitticket.php?step=2&deptid=1`. The contact page has the office Google Map. | this phase |
| SEO | `/?s=` redirects to `/search/`. Legacy URLs redirect: `/linux-hosting/`, `/vps/`, `/ssl-certificate/`, `/buy-domain-name/`, `/linux-dedicated-server/`, `/domain-name-search/`. `llms.txt` lists prices at a glance. The hub, contact and about pages render through their own routes again, which fixes titles like "Domains (hub)" and the generic descriptions. | this phase |

## Remaining

- **Content, editable in the dashboard.** Per-page WordPress FAQs, per-page testimonial sets, the full legal texts (privacy, terms, AUP, SLA are still short versions), and the domain and VPS FAQ wording.
- **Calculators.** The WordPress bandwidth and transfer-time tools use decimal units (1000), add a TB output and a plan suggestion, and offer bit/s and Tbit/s. The new tools use 1024.
- **Affiliate calculator.** The WordPress version is plan-based: orders × plan price × 20%.
- **USA shared plans.** Add them to Pricing Plans with region "USA" after this code is deployed.
- **India VPS Silver.** WordPress links pid 115, which clashes with a promo product. Confirm the real WHMCS pid.
- **Linux hosting.** The 4-tab feature widget. The blog index is missing its 15 category links.
