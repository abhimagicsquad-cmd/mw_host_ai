import { domainGuides } from "./domains"
import { hostingGuides } from "./hosting"
import { migrationGuides } from "./migration"
import { securityGuides } from "./security"
import type { GuideCategorySlug, KBGuide } from "./types"
import { wordpressGuides } from "./wordpress"

export type { GuideBlock, GuideCategorySlug, GuideSection, KBGuide } from "./types"

export const kbGuides: KBGuide[] = [...hostingGuides, ...wordpressGuides, ...domainGuides, ...securityGuides, ...migrationGuides]

/**
 * Help-centre categories the guides live in. "domains" and "ssl-security" already exist in the
 * dashboard's knowledge base; the other three are added alongside the dashboard's categories.
 * `icon` is a name from lib/icon-map.
 */
export const guideCategories: { slug: GuideCategorySlug; name: string; description: string; icon: string }[] = [
  { slug: "web-hosting", name: "Hosting Guides", description: "Shared, VPS, cloud and reseller hosting explained — and how to choose.", icon: "Server" },
  { slug: "wordpress", name: "WordPress", description: "WordPress hosting, speed and the difference between managed and shared plans.", icon: "Rocket" },
  { slug: "domains", name: "Domains", description: "Registration, transfers, DNS, and nameservers.", icon: "Globe" },
  { slug: "ssl-security", name: "SSL & Security", description: "Certificates, malware, and account security.", icon: "Lock" },
  { slug: "migration", name: "Website Migration", description: "Checklists and step-by-step guides for moving your site to a new host.", icon: "ArrowRightLeft" },
]

export function getGuide(slug: string): KBGuide | undefined {
  return kbGuides.find((guide) => guide.slug === slug)
}

/** Route path of a guide (served at /knowledge-base/<slug>/). */
export const guideHref = (slug: string) => `/knowledge-base/${slug}`

export function guidesInCategory(slug: string): KBGuide[] {
  return kbGuides.filter((guide) => guide.categorySlug === slug)
}

export function guideCategoryName(slug: string): string {
  return guideCategories.find((category) => category.slug === slug)?.name ?? slug
}

/**
 * The guides that support each product page (topic clusters): exact route paths first, then
 * section prefixes. Used by the answer block on hosting, server, domain, email and SSL pages.
 */
const SERVICE_GUIDES: [string, string[]][] = [
  ["/hosting/wordpress-hosting", ["what-is-managed-wordpress-hosting", "wordpress-hosting-vs-shared-hosting", "wordpress-migration-guide"]],
  ["/hosting/seo-hosting", ["how-to-speed-up-wordpress", "what-is-ssl", "what-is-shared-hosting"]],
  ["/hosting/unlimited-hosting", ["what-is-shared-hosting", "what-is-reseller-hosting", "website-migration-checklist"]],
  ["/hosting/usa-web-hosting", ["what-is-shared-hosting", "what-is-cloud-hosting", "website-migration-checklist"]],
  ["/hosting/linux-shared-hosting", ["what-is-shared-hosting", "what-is-vps-hosting", "wordpress-hosting-vs-shared-hosting"]],
  ["/hosting/", ["what-is-shared-hosting", "domain-vs-hosting", "website-migration-checklist"]],
  ["/vps-hosting", ["what-is-vps-hosting", "what-is-cloud-hosting", "what-is-shared-hosting"]],
  ["/dedicated-hosting/", ["what-is-vps-hosting", "what-is-cloud-hosting", "how-website-backups-work"]],
  ["/domain/transfer-your-domain-name", ["how-to-transfer-a-domain", "how-domain-registration-works", "domain-vs-hosting"]],
  ["/domain/", ["how-domain-registration-works", "domain-vs-hosting", "how-to-transfer-a-domain"]],
  ["/email-hosting/", ["domain-vs-hosting", "common-website-security-threats", "how-domain-registration-works"]],
  ["/ssl", ["what-is-ssl", "common-website-security-threats", "how-website-backups-work"]],
]

export function guidesForService(path: string): KBGuide[] {
  const match = SERVICE_GUIDES.find(([key]) => (key.endsWith("/") ? path.startsWith(key) : path === key || path.startsWith(`${key}/`)))
  return (match?.[1] ?? []).map(getGuide).filter((guide): guide is KBGuide => guide !== undefined)
}
