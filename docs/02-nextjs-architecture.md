# Next.js Project Architecture

Scalable structure for the MagicWorksHost rebuild — Next.js App Router + TypeScript + Tailwind + Shadcn UI + Sanity + Framer Motion + React Hook Form + Zod.

```
mw-host-nextjs/
├── src/
│   ├── app/
│   │   ├── (marketing)/                     # route group: all public content pages
│   │   │   ├── page.tsx                     # Homepage
│   │   │   ├── about-us/page.tsx
│   │   │   ├── contact-us/page.tsx
│   │   │   ├── support/page.tsx
│   │   │   ├── become-our-affiliate/page.tsx
│   │   │   ├── compare-hosting-plans/page.tsx
│   │   │   ├── sitemap-page/page.tsx        # human-readable sitemap (avoids clash w/ sitemap.xml route)
│   │   │   ├── hosting/
│   │   │   │   └── [slug]/page.tsx          # dynamic: all Family A hosting plan pages
│   │   │   ├── vps-hosting/page.tsx
│   │   │   ├── dedicated-hosting/
│   │   │   │   └── [slug]/page.tsx          # dynamic: dedicated + managed-dedicated + linux-dedicated (merged type)
│   │   │   ├── domain/
│   │   │   │   └── [slug]/page.tsx          # dynamic: all Family B domain pages
│   │   │   ├── ssl/
│   │   │   │   ├── page.tsx                 # buy-ssl-certificate (pillar/hub)
│   │   │   │   └── [slug]/page.tsx          # dynamic: 5 certificate sub-pages
│   │   │   ├── email-hosting/
│   │   │   │   └── [slug]/page.tsx          # business / enterprise
│   │   │   ├── tools/
│   │   │   │   ├── bandwidth-calculator/page.tsx
│   │   │   │   ├── data-unit-calculator/page.tsx
│   │   │   │   └── transfer-time-calculator/page.tsx
│   │   │   ├── legal/
│   │   │   │   └── [slug]/page.tsx          # dynamic: all 7 legal docs, one Sanity type
│   │   │   └── thank-you/page.tsx           # single route, message varies by ?type= query param
│   │   ├── (blog)/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx                 # index, paginated
│   │   │   │   └── [slug]/page.tsx          # single post
│   │   │   └── category/
│   │   │       └── [category]/page.tsx      # category archive
│   │   ├── (promo)/
│   │   │   └── [campaignSlug]/page.tsx      # dynamic: 50-off and future promo landing pages
│   │   ├── api/
│   │   │   ├── forms/
│   │   │   │   └── route.ts                 # unified lead-form submission handler
│   │   │   └── revalidate/route.ts          # Sanity webhook → on-demand ISR revalidation
│   │   ├── sitemap.ts                       # generates sitemap.xml natively (App Router convention)
│   │   ├── robots.ts
│   │   ├── layout.tsx                       # root layout: fonts, providers, Header/Footer
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── common/                          # generic, content-agnostic primitives (Badge, Price, Stat, Rating)
│   │   ├── layout/                          # Header, Footer, MobileNav, TopBar, StickyHeaderWrapper
│   │   ├── sections/                        # page-section blocks (see 04-component-mapping.md)
│   │   ├── forms/                           # LeadForm, NewsletterForm, CommentForm + field subcomponents
│   │   ├── ui/                              # Shadcn primitives (button, card, accordion, dialog, tabs, input...)
│   │
│   ├── features/
│   │   ├── pricing/                         # pricing-table logic, plan comparison, billing-cycle switcher
│   │   ├── calculators/                     # bandwidth / data-unit / transfer-time calculator logic
│   │   ├── affiliate/                       # earnings estimator widget logic
│   │   └── blog/                            # blog listing/pagination/related-posts logic
│   │
│   ├── hooks/
│   │   ├── use-media-query.ts
│   │   ├── use-sticky-header.ts
│   │   └── use-billing-cycle.ts
│   │
│   ├── lib/
│   │   ├── sanity/                          # (mirrors src/sanity/lib below — re-exported for app code)
│   │   ├── seo.ts                           # metadata + JSON-LD builder helpers
│   │   ├── whmcs.ts                         # cart-link builder (pid/promocode/billingcycle)
│   │   ├── email.ts                         # transactional email sender wrapper
│   │   └── utils.ts                         # cn(), formatters
│   │
│   ├── services/
│   │   ├── forms-service.ts                 # form submission → email/CRM
│   │   └── recaptcha-service.ts             # (or Turnstile) verification
│   │
│   ├── schemas/                             # Zod schemas (form validation + Sanity-shape validation)
│   │   ├── contact-form.schema.ts
│   │   ├── affiliate-form.schema.ts
│   │   └── newsletter-form.schema.ts
│   │
│   ├── types/                               # TypeScript types generated/mirrored from Sanity schemas
│   ├── utils/                               # pure helper functions (currency formatting, date formatting)
│   ├── constants/
│   │   ├── site-config.ts                   # global contact info, social links, nav structure
│   │   └── nav-items.ts
│   │
│   ├── sanity/
│   │   ├── schemas/                         # see 05-sanity-schema-plan.md
│   │   │   ├── documents/
│   │   │   ├── objects/
│   │   │   └── singletons/
│   │   ├── queries/                         # GROQ queries, one file per content type
│   │   ├── lib/
│   │   │   ├── client.ts
│   │   │   ├── image.ts                     # urlFor() image builder
│   │   │   └── live.ts                      # (if using Sanity Live/Visual Editing)
│   │   └── structure.ts                     # Studio desk structure customization
│   │
│   └── styles/
│       └── tailwind tokens live in tailwind.config.ts, not a separate styles dir
│
├── sanity.config.ts                         # Sanity Studio config (embedded studio route or standalone)
├── public/
│   ├── icons/ (favicons only — UI icons come from lucide-react, not files)
│   └── images/ (static, non-CMS assets: og-default.jpg, logo fallback)
├── tailwind.config.ts
├── next.config.ts
├── middleware.ts                            # legacy-URL 301 redirects (see 03-route-mapping.md)
├── .env.local
└── package.json
```

## Key architectural decisions

- **Route groups** `(marketing)`, `(blog)`, `(promo)` keep the app directory organized without affecting URLs.
- **Dynamic `[slug]` routes per template family** (hosting, dedicated-hosting, domain, ssl, email-hosting, legal) instead of one static `page.tsx` per WordPress page — this directly fixes the content-duplication problems found in the audit (dedicated vs. managed-dedicated, 5 near-identical SSL pages) by making them data variations of one template, not copy-pasted routes.
- **One `/thank-you` route** with a `?type=` param replaces WordPress's three near-identical thank-you pages.
- **`middleware.ts`** owns all legacy-URL redirects so WordPress's exact paths (e.g. `/domain-name-search-landing-page/`) 301 to their new canonical route without polluting route definitions.
- **`app/sitemap.ts` + `app/robots.ts`** replace Yoast natively — no plugin needed.
- **`api/revalidate`** + Sanity webhooks give on-demand ISR, replacing LiteSpeed's full-page cache model with Vercel's edge cache.
