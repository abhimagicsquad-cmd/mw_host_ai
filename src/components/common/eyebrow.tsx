import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EyebrowProps = {
  children: ReactNode
  icon?: LucideIcon
  tone?: "orange" | "light"
  className?: string
}

export function Eyebrow({ children, icon: Icon, tone = "orange", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase",
        tone === "orange"
          // Opaque bg-orange-50 (not a translucent /10 tint) — a translucent tint compounds
          // with whatever section background sits behind it and can drop below AA contrast
          // on alt/tinted sections; an opaque chip keeps contrast constant everywhere.
          ? "border-brand-orange/20 bg-orange-50 text-brand-orange-accessible"
          : "border-white/15 bg-white/10 text-white/90 backdrop-blur-sm",
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
    </span>
  )
}
