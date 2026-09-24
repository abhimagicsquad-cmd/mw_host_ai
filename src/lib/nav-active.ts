import { siteConfig } from "@/constants/site-config"
import type { NavItem } from "@/types/nav"

const siteHost = new URL(siteConfig.url).hostname

/**
 * Normalises a nav href or the current pathname to a comparable path: drops query/hash,
 * trailing slashes and case. Absolute URLs to this site are reduced to their path; links
 * to any other host return `null` (they can never be "the current page").
 */
function normalizePath(href: string): string | null {
  let url: URL
  try {
    url = new URL(href, siteConfig.url)
  } catch {
    return null
  }
  if (url.hostname !== siteHost) return null
  const path = decodeURIComponent(url.pathname).replace(/\/+$/, "").toLowerCase()
  return path || "/"
}

/**
 * How well `href` matches `pathname`: the matched path's length (longer = more specific),
 * or -1 for no match. A match is an exact path or a whole-segment prefix, so `/hosting`
 * matches `/hosting/seo-hosting` but never `/hosting-plans`. `/` only matches itself.
 */
function matchScore(href: string, pathname: string): number {
  const path = normalizePath(href)
  if (!path) return -1
  if (path === pathname) return path.length
  if (path !== "/" && pathname.startsWith(`${path}/`)) return path.length
  return -1
}

export type ActiveNav = {
  /** Label of the top-level item to highlight. */
  itemLabel: string | null
  /** Href of the submenu link to highlight (only set when a submenu link matched). */
  linkHref: string | null
}

/**
 * Resolves which top-level item (and, if any, which submenu link) represents the current
 * page. The single most specific match across the whole menu wins, so at most one parent
 * and one child are ever active. When a parent's own href and one of its submenu links
 * match equally well (e.g. "Resources" and "Blogs" both → /blog), the submenu link wins so
 * both get highlighted.
 */
export function getActiveNav(items: NavItem[], currentPath: string): ActiveNav {
  const pathname = normalizePath(currentPath) ?? "/"
  let best: ActiveNav & { score: number } = { itemLabel: null, linkHref: null, score: -1 }

  for (const item of items) {
    for (const link of item.columns?.flatMap((column) => column.links) ?? []) {
      if (link.external) continue
      const score = matchScore(link.href, pathname)
      if (score > best.score) best = { itemLabel: item.label, linkHref: link.href, score }
    }
    if (item.href && !item.external) {
      const score = matchScore(item.href, pathname)
      if (score > best.score) best = { itemLabel: item.label, linkHref: null, score }
    }
  }

  return { itemLabel: best.itemLabel, linkHref: best.linkHref }
}
