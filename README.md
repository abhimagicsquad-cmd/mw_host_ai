# MagicWorksHost.com → Next.js + Sanity Migration Blueprint

This repository contains the forensic audit and migration blueprint for rebuilding **magicworkshost.com** (a WordPress-based web hosting reseller site) in Next.js (App Router) + TypeScript + Tailwind + Shadcn UI + Sanity CMS + Vercel.

**UI foundation is built; real pages are not.** The Next.js + TypeScript + Tailwind + Shadcn UI project is scaffolded and the full reusable component layer (Header, Footer, nav system, mobile drawer, CTA/form/section components) is in place and verified — see `docs/08-ui-foundation-summary.md`. No real site routes (Home, About, Contact, hosting/domain/SSL/email families, etc.) exist yet; that's the next phase, pending approval.

## Documents

1. [Website Audit Report](docs/01-website-audit-report.md) — full sitemap, tech-stack reverse engineering, header/hero/footer analysis, section-by-section inventory, form inventory, SEO audit, performance audit, design system, asset audit, and open risks.
2. [Next.js Project Architecture](docs/02-nextjs-architecture.md) — folder structure and key decisions.
3. [Route Mapping](docs/03-route-mapping.md) — every WordPress URL → new Next.js route, including the 42-post blog redirect list.
4. [Component Mapping](docs/04-component-mapping.md) — every recurring content block mapped to a reusable component.
5. [Sanity Schema Blueprint](docs/05-sanity-schema-plan.md) — document/object/singleton field plan (no code yet).
6. [AI-Native Upgrade Recommendations](docs/06-ai-native-upgrade-recommendations.md) — UX/performance/SEO/accessibility/trust improvements, current branding preserved.
7. [Development Roadmap](docs/07-development-roadmap.md) — phased execution plan, Phase 0 through Phase 9.
8. [UI Foundation Summary](docs/08-ui-foundation-summary.md) — what was built in this phase: folder structure, component list, reusability strategy, and what's deferred.
9. [Project Accounts](docs/09-project-accounts.md) — GitHub/Sanity/Vercel connection status, env vars, and what's still missing (API tokens, email/captcha providers). Supabase intentionally not connected yet.

## Live links

- Repo: https://github.com/abhimagicsquad-cmd/mw_host_ai
- Production: https://mw-host-ai.vercel.app
- Sanity project: https://www.sanity.io/manage/project/uf33qaon

## Critical items before development starts

See §12 of the audit report — several things need manual browser verification (form fields, a possibly-dead `/migration-status/` route, missing domain-search widget, buggy SSL pricing) before Sanity content entry and Zod schemas can be finalized.

## Site-wide contact info (new)

- Email: abhimagicsquad@gmail.com
- Phone: 8421903846

These replace the current live site's `sales@magicworkshost.com` / `+91 9764746633` and should be set as the default values in the `siteSettings` Sanity singleton (see schema blueprint §Singletons).
