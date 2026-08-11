"use client"

import type { ReactNode } from "react"

import { useStickyHeader } from "@/hooks/use-sticky-header"
import { cn } from "@/lib/utils"

/**
 * `TopBar`/`MainHeader` are async Server Components (they fetch Sanity data) and must be
 * rendered by a Server Component ancestor and passed in as `children` — React 19 forbids
 * async Client Components, so statically importing them here (this module is "use client"
 * for `useStickyHeader`) throws "async Client Component" errors and breaks hydration for
 * the whole page.
 */
export function Header({ children }: { children: ReactNode }) {
  const isScrolled = useStickyHeader()

  return (
    <header className={cn("sticky top-0 z-40 w-full", isScrolled && "shadow-sm")}>
      {children}
    </header>
  )
}
