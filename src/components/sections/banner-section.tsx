import type { LucideIcon } from "lucide-react"
import { Megaphone } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { cn } from "@/lib/utils"
import type { CTA } from "@/types/content"

type BannerSectionProps = {
  message: string
  icon?: LucideIcon
  cta?: CTA
  tone?: "orange" | "navy"
  dismissible?: boolean
  className?: string
}

export function BannerSection({ message, icon: Icon = Megaphone, cta, tone = "orange", className }: BannerSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-3 text-center text-sm sm:flex-row",
        tone === "orange" ? "bg-brand-orange text-white" : "bg-brand-navy text-white",
        className
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        <Icon className="size-4" />
        {message}
      </span>
      {cta ? (
        <CTAButton href={cta.href} external={cta.external} size="sm" variant="ghost" className="text-white underline hover:bg-transparent hover:no-underline">
          {cta.label}
        </CTAButton>
      ) : null}
    </div>
  )
}
