import type { NavColumn, NavItem, NavLink } from "@/types/nav"

/**
 * Pages added in code after the dashboard menus were set up (cloud/reseller hosting and the
 * website services). They're merged into whichever menu is live — dashboard or built-in — so
 * they're reachable from the header and footer without editing menus in the database. A link
 * an editor has already added anywhere in the menu is never duplicated, so moving these into
 * the dashboard's Menus later takes over cleanly.
 */
const HOSTING_ADDITIONS: { column: "first" | "last"; link: NavLink }[] = [
  { column: "first", link: { label: "Reseller Hosting", href: "/services/reseller-hosting", icon: "Users" } },
  { column: "last", link: { label: "Cloud Hosting", href: "/services/cloud-hosting", icon: "Server" } },
]

const SERVICES_ITEM: NavItem = {
  label: "Services",
  href: "/services",
  columns: [
    {
      heading: "Website Services",
      links: [
        { label: "Website Development", href: "/services/website-development", icon: "MousePointerClick" },
        { label: "Website Maintenance", href: "/services/website-maintenance", icon: "Settings" },
        { label: "Website Migration", href: "/services/website-migration", icon: "ArrowRightLeft" },
        { label: "Website Security", href: "/services/website-security", icon: "ShieldCheck" },
      ],
    },
  ],
  featured: {
    title: "Not sure what you need?",
    description: "Tell us about your website and we'll recommend the right service.",
    href: "/services",
    icon: "LifeBuoy",
  },
}

const FOOTER_SERVICE_LINKS = [
  { label: "Cloud Hosting", href: "/services/cloud-hosting" },
  { label: "Reseller Hosting", href: "/services/reseller-hosting" },
  { label: "Website Services", href: "/services" },
]

const normalize = (href?: string) => (href ?? "").replace(/\/+$/, "") || "/"

function menuHrefs(items: NavItem[]): Set<string> {
  const hrefs = new Set<string>()
  for (const item of items) {
    hrefs.add(normalize(item.href))
    for (const column of item.columns ?? []) for (const link of column.links) hrefs.add(normalize(link.href))
  }
  return hrefs
}

export function withAddedNavItems(items: NavItem[]): NavItem[] {
  const present = menuHrefs(items)
  const result = items.map((item) => {
    if (normalize(item.href) !== "/hosting" || !item.columns?.length) return item
    const columns: NavColumn[] = item.columns.map((column) => ({ ...column, links: [...column.links] }))
    for (const { column, link } of HOSTING_ADDITIONS) {
      if (present.has(link.href)) continue
      columns[column === "first" ? 0 : columns.length - 1].links.push(link)
      present.add(link.href)
    }
    return { ...item, columns }
  })

  const serviceLinks = SERVICES_ITEM.columns![0].links.filter((link) => !present.has(link.href))
  if (!present.has("/services") && serviceLinks.length) {
    const item = { ...SERVICES_ITEM, columns: [{ ...SERVICES_ITEM.columns![0], links: serviceLinks }] }
    // After "Email" (else before "Resources", else at the end) — next to the other product menus.
    const emailIndex = result.findIndex((entry) => normalize(entry.href) === "/email-hosting")
    const resourcesIndex = result.findIndex((entry) => entry.label.toLowerCase() === "resources")
    const at = emailIndex >= 0 ? emailIndex + 1 : resourcesIndex >= 0 ? resourcesIndex : result.length
    result.splice(at, 0, item)
  }
  return result
}

/** Adds the new service pages to the footer's "Services" column (or the first column). */
export function withAddedFooterLinks<T extends { heading?: string; links: { label: string; href: string; external?: boolean }[] }>(columns: T[]): T[] {
  const present = new Set(columns.flatMap((column) => column.links.map((link) => normalize(link.href))))
  const additions = FOOTER_SERVICE_LINKS.filter((link) => !present.has(link.href))
  if (!additions.length) return columns
  const target = Math.max(0, columns.findIndex((column) => column.heading?.toLowerCase() === "services"))
  return columns.map((column, index) => (index === target ? { ...column, links: [...column.links, ...additions] } : column))
}
