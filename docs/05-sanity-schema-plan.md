# Sanity CMS Schema Blueprint

Blueprint only — field lists and relationships, no schema code yet (per project rules). Organized into **Documents** (top-level, own URL or standalone entity), **Objects** (reusable embedded structures), and **Singletons** (one instance sitewide).

---

## Singletons (`sanity/schemas/singletons/`)

### `siteSettings`
Global config referenced everywhere.
- `siteName`, `logo` (image), `favicon` (image)
- `contactPhone` (string) — **default value: `8421903846`**
- `contactEmail` (string) — **default value: `abhimagicsquad@gmail.com`**
- `whatsappNumber` (string)
- `officeAddress` (text)
- `businessHours` (array of `{department, days, hours}` objects)
- `socialLinks` (array of `{platform, url}`)
- `defaultSeo` (object: `metaTitle`, `metaDescription`, `ogImage`)
- `whmcsClientAreaUrl`, `whmcsKnowledgebaseUrl` (external link bases)

### `navigation`
- `mainMenu` (array of `navItem` objects, supports nested `children` for dropdowns)
- `footerColumns` (array of `{title, links[]}`)
- `topBarLinks` (array of `{label, url}`)

---

## Objects (`sanity/schemas/objects/`)

### `seo` (reusable on every document)
`metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `ogType` (select: website/product/article), `noIndex` (boolean), `schemaType` (select: Organization/Product/Article/FAQPage/None — drives which JSON-LD builder runs)

### `pricingTier`
`name`, `monthlyPrice`, `regularPrice`, `billingOptions` (array of `{cycle: annually|biennially|triennially|monthly, price, discountPercent, whmcsPid, promoCode}`), `storage`, `bandwidth`, `ramGb`, `vcpu`, `emailAccounts`, `ftpAccounts`, `features` (array of strings), `isHighlighted` (boolean — "most popular" badge)

### `regionPricing`
`region` (India/USA), `tiers` (array of `pricingTier`)

### `faqItem`
`question`, `answer` (portable text)

### `testimonial` (could also be promoted to its own document type if reused/queried independently — recommended, see Documents below)

### `ctaBanner`
`heading`, `phone`, `email`, `buttonText`, `buttonLink`

### `featureTile`
`icon` (Lucide icon name, string select), `title`, `description`

### `statComparison`
`beforeLabel`, `beforeValue`, `afterLabel`, `afterValue`, `improvementNote`

### `pageBuilder` (array field used on flexible pages — homepage, promo pages)
Array of typed objects: `heroBlock`, `pricingTableBlock`, `featureGridBlock`, `testimonialBlock`, `trustLogoBlock`, `faqBlock`, `ctaBannerBlock`, `richTextBlock`, `comparisonTableBlock` — enables marketers to reorder sections without a deploy, matching the "AI-native, CMS-managed" goal.

---

## Documents (`sanity/schemas/documents/`)

### `homePage` (singleton-like document, one instance)
`hero` (heading, subheading, features[], ctaPrimary, ctaSecondary), `statComparison`, `pricingTiers` (reference to shared `hostingPlanSet` or inline), `whyChooseUs` (featureTile[]), `testimonials` (references), `trustLogos` (image[]), `ctaBanner`, `seo`

### `hostingPlanPage`
Covers all Family A pages (buy-web-hosting, unlimited, seo-hosting, wordpress-hosting, linux-shared, usa-hosting) as **one document type with a `variant` field**, eliminating the template-duplication risk found in the audit.
- `title`, `slug`, `variant` (select: standard/seo/wordpress/linux-shared/usa)
- `hero` (object)
- `pricingTiers` (array of `pricingTier`, or reference to a shared `hostingPlanSet` document so the 6-tier NVMe grid is edited once and reused across all pages that show it)
- `tabbedFeatures` (optional array, used by seo/linux-shared variants)
- `faq` (array of `faqItem`)
- `testimonials` (references to `testimonial` documents)
- `seo`

### `hostingPlanSet` (shared pricing data, referenced by multiple pages)
`name` (e.g. "NVMe Shared Hosting Grid", "USA Hosting Grid", "50-off Promo Grid"), `tiers` (array of `pricingTier`) — **single edit point** so the homepage, buy-web-hosting, and 50-off pages don't drift out of sync as they do today.

### `dedicatedHostingPage`
Merges Dedicated Server, Managed Dedicated, Linux Dedicated into one type — directly fixes the "functionally identical pages" issue from the audit.
- `title`, `slug`, `isManaged` (boolean), `osType` (select: standard/linux)
- `regionPricing` (array of `regionPricing` — India/USA)
- `faq`, `testimonials`, `seo`

### `vpsHostingPage`
Standalone (only one exists today): `hero`, `regionPricing`, `faq`, `testimonials`, `seo`

### `domainPage`
Covers all 7 Family B pages via `variant` (registration/transfer/renew/india/cheap/search/hosting-bundle).
- `hero`, `tldPricing` (array of `{tld, price}`), `domainPerks` (featureTile[]), `hostingGridRef` (reference to `hostingPlanSet`), `faq`, `testimonials`, `seo`
- `hasSearchWidget` (boolean) — gate for the unresolved WHOIS-search feature flagged in the audit

### `sslPage`
- `title`, `slug`, `isPillar` (boolean — true only for `/ssl`)
- `certificateTiers` (array: `{tierName: DV|BV|EV|Wildcard|SNI, priceYearly, features[]}`) — **must be populated with reconciled real pricing**, not the flat ₹5,000 bug found live
- `howItWorksSteps`, `installGuideSteps`, `faq`, `seo`

### `emailHostingPage`
`title`, `slug`, `pricePerMailbox`, `storageGb`, `fileStorageGb`, `features[]`, `seo`

### `legalPage`
`title`, `slug`, `body` (portable text), `lastUpdated` (date — **new field, absent on live site**), `seo`

### `toolPage` (calculators)
`title`, `slug`, `toolType` (select: bandwidth/data-unit/transfer-time), `description`, `seo` — logic lives in code (`features/calculators/`), CMS only holds copy/SEO

### `promoPage`
`title`, `slug`, `campaignActive` (boolean), `expiresAt` (datetime, optional), `pricingSet` (reference to `hostingPlanSet`), `pageBuilder` (flexible sections), `seo`

### `blogPost`
`title`, `slug`, `excerpt`, `featuredImage`, `author` (reference to `author`), `categories` (references to `category`), `publishedAt`, `updatedAt`, `body` (portable text with embedded CTA/image/code blocks), `seo`

### `author`
`name`, `photo`, `bio`, `role`

### `category`
`title`, `slug`, `description`, `seo`

### `testimonial`
`customerName`, `customerTitle`, `companyName`, `photo`, `quote`, `usedOnPages` (optional reference array, for editorial control over which pages show which testimonials — fixes today's inconsistent reuse pattern)

### `trustedLogo`
`companyName`, `logo` (image)

### `contactPage`, `aboutPage`, `supportPage`, `affiliatePage`
One-off documents for the remaining unique pages, each with a `pageBuilder` array plus type-specific fields:
- `contactPage`: extends with `contactForm` config reference (which `LeadForm` variant to render)
- `affiliatePage`: `commissionPercent`, `minWithdrawal`, `cookieDurationDays`, `churnRateClaim`, earnings-calculator config
- `supportPage`: `supportChannels` (array of `{channel, description, link}`)

### `redirect`
`fromPath`, `toPath`, `type` (301/302) — editorial-manageable redirect table backing `middleware.ts`, seeded initially from `03-route-mapping.md`.

---

## Relationships summary
- `hostingPlanPage`, `promoPage`, `homePage`, `domainPage` all **reference** `hostingPlanSet` rather than embedding pricing inline — single source of truth for the NVMe grid.
- `dedicatedHostingPage` and `vpsHostingPage` each hold their own `regionPricing` (India/USA pairs are tightly coupled per page, less benefit from extraction).
- `testimonial` and `trustedLogo` are standalone documents referenced by array fields on every page type that shows them — editors can add a new testimonial once and assign it to multiple pages instead of the current copy-paste pattern.
- Every document type includes the shared `seo` object for consistent metadata handling and to enforce the audit's recommendation of unique titles/descriptions (add a Studio-side validation rule checking `metaDescription` uniqueness across documents).
