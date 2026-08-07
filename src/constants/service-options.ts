/**
 * Single source of truth for the "which service is this about" dropdown used
 * across every lead-capture surface — quick lead popups, the hero, the contact
 * page, and the detailed quote form. Values map 1:1 to the real product lineup
 * (see docs/03-route-mapping.md) so a selection can eventually route straight
 * to the matching product page or CRM pipeline without a translation layer.
 */
export const serviceOptions = [
  { value: "shared-hosting", label: "Shared Web Hosting" },
  { value: "wordpress-hosting", label: "WordPress Hosting" },
  { value: "vps-hosting", label: "VPS Hosting" },
  { value: "dedicated-server", label: "Dedicated Server" },
  { value: "managed-dedicated-server", label: "Managed Dedicated Server" },
  { value: "domain", label: "Domain Registration" },
  { value: "ssl", label: "SSL Certificate" },
  { value: "business-email", label: "Business Email Hosting" },
  { value: "enterprise-email", label: "Enterprise Email Hosting" },
  { value: "not-sure", label: "Not sure yet / Need advice" },
] as const

export type ServiceOptionValue = (typeof serviceOptions)[number]["value"]

/**
 * Shown only when the enquiry is hosting-related (progressive disclosure in
 * <GetQuoteForm />) — the tier within "hosting", independent of which
 * marketing page (SEO/WordPress/Linux/Unlimited) the customer arrived from,
 * since those are all the same underlying shared-hosting tier per the audit.
 */
export const hostingTypeOptions = [
  { value: "shared", label: "Shared Hosting" },
  { value: "vps", label: "VPS Hosting" },
  { value: "dedicated", label: "Dedicated Server" },
  { value: "managed-dedicated", label: "Managed Dedicated Server" },
] as const

export type HostingTypeValue = (typeof hostingTypeOptions)[number]["value"]

export const hostingRelatedServiceValues: ServiceOptionValue[] = [
  "shared-hosting",
  "wordpress-hosting",
  "vps-hosting",
  "dedicated-server",
  "managed-dedicated-server",
]
