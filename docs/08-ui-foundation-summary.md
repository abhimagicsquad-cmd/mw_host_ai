# UI Foundation & Reusable Architecture — Summary

Phase output for the UI-foundation task: Next.js App Router + TypeScript + Tailwind CSS v4 + Shadcn UI project scaffolded from scratch (no `package.json` existed before this), with the full reusable component layer built and visually verified. No real site pages (Home, About, Contact, etc.) were created — see `src/app/preview/page.tsx`, a temporary showcase route only, to be deleted once page-building starts.

## Stack notes

- **Next.js 16.3.0**, React 19.2.8, Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts` — tokens live in `src/app/globals.css`).
- **Shadcn UI is on its Base UI variant** (`@base-ui/react`), not Radix — this is the current shadcn default as of this build. Polymorphism uses a `render` prop (`<Button render={<Link href=... />} nativeButton={false}>`), not `asChild`.
- **lucide-react dropped brand/social icons** in the installed version. `src/components/common/social-icons.tsx` hand-rolls Facebook/Twitter/LinkedIn/Instagram marks to fill the gap.
- React Hook Form + Zod + `@hookform/resolvers` power every form. `framer-motion` is installed per the architecture doc but not yet imported anywhere — reserved for page-level animation work.
- Brand tokens (from the audit) are wired into `globals.css`: `brand-orange` (#ff6600), `brand-navy` (#2a363f), `brand-navy-dark` (#1c2329), `brand-cta-secondary` cyan gradient, `brand-whatsapp`, plus `surface-alt`/`border-alt`/`body-text` grays. Font: Geist only (single variable font via `next/font/google`, exposed as `--font-geist` and mapped once to `--font-sans` in `globals.css`; Tailwind's other font tokens are cleared, so components never set a font).

## Folder structure

```
src/
├── app/
│   ├── layout.tsx            # root layout — fonts, TooltipProvider, Header, Footer
│   ├── globals.css           # Tailwind v4 theme tokens + brand colors
│   └── preview/page.tsx      # TEMPORARY component showcase — delete before real pages ship
│
├── components/
│   ├── ui/                   # Shadcn primitives (unmodified except carousel.tsx lint fix)
│   ├── common/                # generic, content-agnostic primitives
│   │   ├── logo.tsx
│   │   ├── cta-button.tsx
│   │   ├── icon-badge.tsx
│   │   ├── rating-stars.tsx
│   │   └── social-icons.tsx
│   ├── layout/
│   │   ├── section-container.tsx
│   │   ├── section-heading.tsx
│   │   ├── header/            # top-bar, main-header, nav-menu, mobile-nav, header
│   │   └── footer/             # footer, footer-column, footer-cta-block
│   ├── sections/               # the 25 required reusable section components
│   └── forms/
│       ├── fields/             # form-field-shell, text-field, textarea-field, select-field, checkbox-field
│       ├── form-status-message.tsx
│       ├── form-submit-button.tsx
│       ├── contact-form.tsx
│       ├── quick-inquiry-form.tsx
│       ├── get-quote-form.tsx
│       └── callback-request-form.tsx
│
├── constants/
│   ├── site-config.ts         # contact info, social links
│   └── nav-items.ts           # main nav (dropdown/mega-menu data) + footer columns
├── schemas/                    # one Zod schema per form + shared field validators
├── types/                      # nav.ts, content.ts — shared prop types for sections
├── hooks/                      # use-media-query, use-sticky-header
└── lib/
    ├── utils.ts (cn)
    ├── fonts.ts
    └── mock-submit.ts          # shared fake network call used by every form
```

## Component list

**Header** — `TopBar` (phone/support/login/social), `MainHeader` (logo + nav + CTA + mobile trigger), `NavMenu` (desktop dropdown, mega-menu ready — Hosting item demonstrates 2 columns + a featured panel), `MobileNav` (Sheet drawer + accordion submenus), `Header` (sticky wrapper via `useStickyHeader`).

**Footer** — `Footer`, `FooterColumn`, `FooterCTABlock`. Quick Links / Services / Resources columns + Contact Information + social icons + copyright bar, CTA block above the link grid. Driven entirely by `constants/nav-items.ts` and `constants/site-config.ts`.

**Layout primitives** — `SectionContainer` (width/background/padding variants), `SectionHeading` (eyebrow/title/description, left or center).

**Sections (all 25 required)** — `HeroSection`, `PageHero`, `CTASection`, `FeaturesSection`, `ServiceGrid`, `ServiceCard`, `PricingSection`, `PricingCard`, `WhyChooseUs`, `TestimonialsSection`, `TestimonialCard`, `FAQSection`, `FAQAccordion`, `ContactSection`, `StatsSection`, `LogoCloud`, `ContentSection`, `ImageContentSection`, `BannerSection`, `NewsletterSection`, `Breadcrumbs`, `SectionContainer`, `SectionHeading`. Every section takes typed props (`types/content.ts`) — no hardcoded copy, ready for Sanity data later.

**Forms** — `ContactForm`, `QuickInquiryForm`, `GetQuoteForm`, `CallbackRequestForm`, all built on the same field components + `mockSubmit()` + Zod schema per form. No API wiring — every submit is a simulated 900ms delay resolving to a success message.

**Common** — `Logo` (text wordmark placeholder — no source SVG was recoverable from the audit), `CTAButton` (primary/secondary/outline/ghost variants matching the two brand CTA styles found in the audit), `IconBadge`, `RatingStars`, `SocialIcons`.

## Reusability strategy

- **Props over hardcoding.** Every section and form field component takes typed content as props (`types/content.ts`, `types/nav.ts`) — nothing renders copy that's baked into the component itself. This is what lets the same `PricingCard` back the homepage grid, a hosting-family page, and the 50-off promo variant without three implementations (the audit's §5.2 finding).
- **One CTA system.** `CTAButton` is the only button used for marketing CTAs across Header, Footer, Hero, CTASection, PricingCard, etc. — two brand styles (orange pill / cyan gradient) instead of the audit's inconsistent one-off buttons.
- **One form architecture.** All four forms share `fields/*`, `FormStatusMessage`, `FormSubmitButton`, and `mockSubmit()`. Swapping the mock for a real `/api/forms` call is a one-line change in `lib/mock-submit.ts` — no component changes.
- **Layout primitives everywhere.** Every section is built on `SectionContainer` + `SectionHeading`, so spacing/width/background stay consistent without each section reinventing its wrapper.
- **Data-driven navigation.** Header and footer render purely from `constants/nav-items.ts` / `site-config.ts` — adding a nav item or footer link never touches component code.
- **Mega-menu-ready by structure, not by content.** `NavItem.columns` supports 1-N columns plus an optional featured panel; today's data mostly uses 1 column (matching the audit's simple dropdowns) except Hosting, which demonstrates the multi-column + featured-panel path.

## Verified

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (one upstream shadcn/Embla lint warning suppressed with a documented `eslint-disable` comment; not app code).
- `npm run build` — succeeds, static.
- Rendered in a real headless-Chromium session (desktop 1440px + mobile 390px): header, mega-menu open state, mobile drawer, every section, and all four forms. Fixed two real issues found this way: missing `nativeButton={false}` on `CTAButton`/`SheetClose` when polymorphed into a `<Link>` (Base UI a11y warning), and a lucide-react brand-icon removal (`Facebook`/`Twitter`/`Linkedin`/`Instagram` no longer exported).

## Missing / deferred (out of this phase's scope)

- **WhatsApp floating action button** — named in the original component-mapping doc, not in this task's explicit component list. Brand token (`brand-whatsapp`) is already in `globals.css` if it's wanted later.
- **Unused Shadcn primitives** — `card`, `dialog`, `dropdown-menu`, `radio-group`, `separator`, `skeleton`, `breadcrumb` were installed as part of the base set but nothing in this layer consumes them yet (the sections use hand-built markup instead of `Card`, and `Breadcrumbs` is a custom component rather than Shadcn's `breadcrumb.tsx`). They're available for page-building.
- **Billing-cycle switcher / plan-comparison logic** — `PricingSection` accepts an optional `tabs` prop (label + plans) for monthly/annual-style switching, but the actual cycle-switching *business logic* belongs in `features/pricing/` per the architecture doc and hasn't been built — this phase only needed the UI shell.
- **`NewsletterForm` as a standalone reusable component** — the brief's required 4 forms are Contact/QuickInquiry/GetQuote/Callback; `NewsletterSection` implements its own inline email-only form directly (same field components, same `mockSubmit`) rather than exporting a fifth top-level form component, since it wasn't in the explicit forms list.
- **Real logo asset, hero illustrations, testimonial photos** — the audit flagged these as unrecoverable from static fetch; `Logo` is a text wordmark placeholder and section media props accept plain image URLs whenever real assets exist.
- Everything explicitly excluded from this task: WHMCS, checkout, domain search, invoices/billing, client area, blog, SEO layer (metadata/JSON-LD/sitemap), deployment.

## Next step

Waiting for approval before building real routes (Home, About, Contact, hosting/domain/SSL/email families, etc.) using this component layer, per `docs/03-route-mapping.md`.
