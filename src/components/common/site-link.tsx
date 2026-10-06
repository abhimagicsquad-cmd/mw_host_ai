import type { ComponentProps } from "react"
import NextLink from "next/link"

import { publicPath } from "@/lib/public-paths"

/**
 * `next/link` for the public website: string hrefs are mapped to their public URL (the
 * WordPress URL structure, trailing slash included) so links never go through a redirect —
 * including hrefs that come from dashboard (CMS) content.
 */
export default function SiteLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink href={typeof href === "string" ? publicPath(href) : href} {...props} />
}
