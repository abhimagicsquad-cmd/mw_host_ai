"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Megaphone, X } from "lucide-react"

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

export function BannerSection({
  message,
  icon: Icon = Megaphone,
  cta,
  tone = "orange",
  dismissible = false,
  className,
}: BannerSectionProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 px-4 py-3 text-center text-sm sm:flex-row",
        tone === "orange" ? "bg-brand-orange text-white" : "bg-brand-navy text-white",
        className
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        <Icon className="size-4 shrink-0" />
        {message}
      </span>
      {cta ? (
        <CTAButton
          href={cta.href}
          external={cta.external}
          size="sm"
          variant="ghost"
          className="text-white underline hover:bg-transparent hover:no-underline"
        >
          {cta.label}
        </CTAButton>
      ) : null}
      {dismissible ? (
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:right-4"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
