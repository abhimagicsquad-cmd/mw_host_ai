"use client"

import type { LucideIcon } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { LeadCTAButton } from "@/components/common/lead-cta-button"
import type { CTA } from "@/types/content"

/** Sentinel href — a CTA using this href opens the lead-capture modal instead of navigating. */
export const LEAD_CTA_HREF = "#lead"

type CTAOrLeadButtonProps = {
  cta: CTA
  source: string
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: LucideIcon
  className?: string
  dialogTitle?: string
  dialogDescription?: string
  defaultService?: string
}

export function CTAOrLeadButton({
  cta,
  source,
  variant,
  size,
  icon,
  className,
  dialogTitle,
  dialogDescription,
  defaultService,
}: CTAOrLeadButtonProps) {
  if (cta.href === LEAD_CTA_HREF) {
    return (
      <LeadCTAButton
        source={source}
        variant={variant}
        size={size}
        icon={icon}
        className={className}
        dialogTitle={dialogTitle}
        dialogDescription={dialogDescription}
        defaultService={defaultService}
      >
        {cta.label}
      </LeadCTAButton>
    )
  }

  return (
    <CTAButton href={cta.href} external={cta.external} variant={variant} size={size} icon={icon} className={className}>
      {cta.label}
    </CTAButton>
  )
}
