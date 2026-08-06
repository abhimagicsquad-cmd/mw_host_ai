# Component Architecture & Mapping

Every recurring content block found in the audit, mapped to a reusable component. Components are grouped by where they live in `src/components/`.

## Layout Components (`components/layout/`)
| Component | Replaces | Notes |
|---|---|---|
| `TopBar` | Header top utility bar | Phone, support/login links, social icons |
| `MainHeader` | Header nav bar | Logo + `NavMenu` + CTA button |
| `NavMenu` / `NavDropdown` | Domain/Hosting/Email/Resources dropdowns | Data-driven from `constants/nav-items.ts` or Sanity `navigation` singleton |
| `MobileNav` | Hamburger menu | Sheet/drawer (Shadcn `Sheet`) |
| `StickyHeaderWrapper` | Sticky header behavior (unconfirmed on live site — verify then implement) | |
| `Footer` | 3-column footer + sub-footer | Legal/Plans/Support columns + contact + social |
| `WhatsAppFAB` | Floating WhatsApp click-to-chat button | Uses new phone number from site settings |

## Section Components (`components/sections/`)
| Component | Used On | Replaces |
|---|---|---|
| `HeroSection` | Every product/domain/SSL/email page + homepage | Pain-point H1 + subheading + feature bullets + dual CTA |
| `SpeedProofSection` | Homepage | Before/after load-time comparison |
| `PricingTable` | Homepage, all hosting/domain pages, 50-off | The 6-tier NVMe grid; props: `plans[]`, `billingCycles[]`, `discountBadge?` |
| `DualRegionPricingTable` | VPS, Dedicated, Managed Dedicated, Linux Dedicated | India/USA side-by-side variant of `PricingTable` |
| `SSLPricingTable` | SSL hub page | 4-row certificate comparison table |
| `SingleSkuCard` | Business/Enterprise Email pages | Single-plan feature card (no tiers) |
| `FeatureGrid` | "Why Choose Us" sections, "With Every Domain You Get" | Icon + heading + description tiles, N-column responsive grid |
| `TabbedFeatures` | SEO Hosting, Linux Shared Hosting | Shadcn `Tabs` |
| `ComparisonTable` | `/compare-hosting-plans` (needs real data — see audit flag) | |
| `TestimonialCarousel` | Nearly every page | Replaces Owl Carousel; photo, name, title, company, quote |
| `TrustLogoCarousel` | Nearly every page | 9-logo strip, replaces Owl Carousel |
| `FAQAccordion` | Most product/domain/SSL pages | Shadcn `Accordion`; wrap with `FAQPage` JSON-LD |
| `CTABanner` | "Call Our Experts" sections | Heading + phone + email, appears on nearly every page |
| `BlogCardGrid` / `BlogCardList` | Blog index, Resources, category archives | Pick one layout, resolve numbered-vs-load-more pagination inconsistency |
| `RelatedPostsRow` | Single blog post | Prev/next + related by category |
| `SocialShareRow` | Single blog post | Email/FB/Twitter/LinkedIn/Pinterest/VK |
| `AffiliateEarningsCalculator` | Become Our Affiliate | Interactive estimator |
| `BandwidthCalculator`, `DataUnitCalculator`, `TransferTimeCalculator` | Tools pages | Pure client components |
| `ContactInfoBlock` | Contact Us, About, footer | Address/phone/email/hours, single source from site settings |
| `AboutStorySection`, `PaymentLogosStrip` | About Us | |
| `PromoHero`, `UrgencyBanner` | Promo landing pages | |
| `LegalDocumentBody` | All 7 legal pages | Portable Text renderer for legal content |
| `ThankYouMessage` | `/thank-you` | Message variant driven by `?type=` param |

## Form Components (`components/forms/`)
| Component | Replaces |
|---|---|
| `LeadForm` | Contact Us form (CF7 #8704), sitewide quick-contact (CF7 #9149), pre-sales form | Parameterized by `formType` prop |
| `AffiliateSignupForm` | Become Our Affiliate `#join-now` form | |
| `NewsletterForm` | Unlocated newsletter signup (verify placement) | |
| `CommentForm` | Blog post comments | Consider Giscus/third-party or a lightweight custom API route instead of native WP comments |
| `RecaptchaProvider` / `TurnstileProvider` | reCAPTCHA v3 | Wraps whichever forms need bot protection |

## UI Primitives (`components/ui/` — Shadcn)
`Button`, `Card`, `Accordion`, `Tabs`, `Sheet`, `Dialog`, `Badge`, `Input`, `Textarea`, `Select`, `Separator`, `Avatar`, `Tooltip`, `Skeleton` (loading states), `Carousel` (Shadcn's Embla-based carousel — replaces Owl Carousel for both testimonials and trust logos).

## Common Components (`components/common/`)
| Component | Purpose |
|---|---|
| `PriceTag` | Formats ₹ pricing with strikethrough "regular" price + discount badge — used across every pricing component |
| `StatCounter` | Before/after stat display (load time, traffic %) |
| `IconIllustration` | Wraps Lucide icons or custom SVG illustrations consistently |
| `RatingStars` | If testimonials get star ratings added |
| `BreadcrumbTrail` | New addition (missing on live site per SEO audit) — renders + emits `BreadcrumbList` JSON-LD |
| `JsonLd` | Generic schema.org script-tag injector, fed by `lib/seo.ts` builders |

## Feature Modules (`features/`)
- `features/pricing/` — plan data typing, billing-cycle toggle state, WHMCS cart-link builder (`lib/whmcs.ts`)
- `features/calculators/` — arithmetic logic extracted from the three calculator components (unit-testable, UI-agnostic)
- `features/affiliate/` — earnings projection formula
- `features/blog/` — pagination/related-post logic

## Cross-cutting notes
- Every section component should accept its content as typed props sourced from a Sanity GROQ query result — no hardcoded copy in components, matching the "everything CMS-managed" goal.
- `PricingTable`, `DualRegionPricingTable`, and `SSLPricingTable` should share a common `PlanCard` sub-component to avoid the three separate pricing implementations the audit found on the live site.
- `HeroSection` should be one flexible component (background variant, stat/trust-signal slot, CTA slot) rather than one-off heroes per page family, directly addressing the copy-paste-hero bug found on the USA hosting page.
