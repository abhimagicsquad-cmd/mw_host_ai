# Content review: new service pages and guides

The pages below went live in code without inventing business facts. Every statement about
MagicWorks Host restates something already published: the plans, the policies, the existing
service pages, or the WordPress site. Where a detail hasn't been published, the page asks for a
quote rather than promising anything.

This file lists those gaps so the owner can fill them in. The same notes are in code, in the
`review` field of each entry in `src/constants/service-landing-data.ts`. That field is never
rendered.

## Service pages (`src/constants/service-landing-data.ts`)

| Page | URL | Placeholder / decision needed |
|---|---|---|
| Cloud Hosting | `/cloud-hosting/` | **Positioning:** sold as the cloud VPS tiers, the same plans and prices as `/vps-hosting/`. The WordPress site calls VPS "cloud VPS" deployed through the MagicWorksHost cloud management platform. Confirm this positioning. **Features:** add any cloud-only features you actually offer (snapshots, hourly billing, scaling, more regions). None are claimed today. |
| Reseller Hosting | `/reseller-hosting/` | **Plans:** neither the WHMCS store nor the WordPress site publishes reseller plans, so the page is a quote request. Add plans, prices and limits when they're decided. **Panel and branding:** confirm the control panel (WHM/cPanel?) and white-label branding before mentioning either. |
| Website Development | `/website-development/` | **Commercial details:** add packages or starting prices, typical timelines and a portfolio link. **Platforms and terms:** confirm the platforms you build on (WordPress/WooCommerce are listed only as project types) and the ownership and handover terms. |
| Website Maintenance | `/website-maintenance/` | **Plans:** publish the maintenance plans (tasks, frequency, response times, price). Tasks are currently listed as "typical", and the quote confirms them. **Scope:** confirm whether you maintain sites hosted elsewhere. |
| Website Migration | `/website-migration/` | **Paid migrations:** state the price of migrations outside the free annual-plan offer (monthly plans, very large sites, VPS/dedicated), if there is one. **Turnaround:** add a typical turnaround time. None is promised today. |
| Website Security | `/website-security/` | **Paid services:** publish the scope and price of malware clean-up and security audits, if they're paid services. **Tooling:** name the malware scanner or WAF only if you want it shown. |

## Knowledge-base guides (`src/constants/kb-guides/`)

Fifteen guides cover hosting, WordPress, domains, security and migration. Their company
statements were checked against the published facts. Points worth a second look:

- **WordPress hosting:** the guides describe it as WordPress-optimised shared hosting with full
  cPanel access, where the customer handles WordPress and plugin updates. This follows the
  existing FAQ ("you keep full control"). Change it if plans include managed updates.
- **SSL (`what-is-ssl`):** the free certificate is described as domain-validated and renewed
  automatically by AutoSSL. That is standard cPanel AutoSSL behaviour.
- **Backups (`how-website-backups-work`):** the guide doesn't state a retention period. Add one
  if you want to publish it.
- **Domain transfers:** the guides use the ICANN 60-day transfer lock and note that ICANN has
  approved changes that may shorten it. Re-check before ICANN's new Transfer Policy takes effect.
- **Dates:** every guide shows "Updated 3 October 2026". Change `updated` when you revise one.

## Elsewhere: hero figures (resolved in Phase 3)

The unverified hero figures listed here before (99.98% uptime, 0.7s load time, 12,000+ businesses,
A+ SSL Labs grade, 5 dedicated IPs, 99.7% spam caught, unqualified free WHOIS privacy, and the
affiliate cookie and payout terms) were removed or corrected in Phase 3. The full claim register,
and the claims still waiting for the owner to confirm, are in `docs/18-phase-3-launch-review.md`.
