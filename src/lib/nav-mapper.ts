import type { NavColumnData, NavItemData } from "@/sanity/types"
import type { NavColumn, NavItem } from "@/types/nav"

export function toNavColumns(columns: NavColumnData[]): NavColumn[] {
  return columns.map((column) => ({
    heading: column.heading,
    links: column.links.map((link) => ({
      label: link.label,
      href: link.href,
      icon: link.icon,
      external: link.external,
    })),
  }))
}

export function toNavItems(items: NavItemData[]): NavItem[] {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    external: item.external,
    columns: item.columns?.length ? toNavColumns(item.columns) : undefined,
    featured: item.featured
      ? {
          title: item.featured.title,
          description: item.featured.description,
          href: item.featured.href,
          icon: item.featured.icon,
        }
      : undefined,
  }))
}
