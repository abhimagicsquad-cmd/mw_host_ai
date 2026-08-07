import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BreadcrumbItem } from "@/types/content"

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  tone?: "light" | "dark"
}

export function Breadcrumbs({ items, tone = "dark" }: BreadcrumbsProps) {
  const isLight = tone === "light"

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className={cn("size-3.5", isLight ? "text-white/40" : "text-muted-foreground")} />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    isLight ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-brand-orange-accessible"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("font-medium", isLight ? "text-white" : "text-brand-navy")}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
