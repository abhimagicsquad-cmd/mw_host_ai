"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import type { LucideIcon } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"

const LeadDialog = dynamic(() => import("@/components/common/lead-dialog").then((mod) => mod.LeadDialog), {
  ssr: false,
})

type LeadCTAButtonProps = {
  children: React.ReactNode
  source: string
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: LucideIcon
  iconPosition?: "start" | "end"
  className?: string
  dialogTitle?: string
  dialogDescription?: string
  /** Pre-selects the lead form's service dropdown, e.g. from a pricing plan or service page CTA. */
  defaultService?: string
}

export function LeadCTAButton({
  children,
  source,
  variant = "primary",
  size = "md",
  icon,
  iconPosition,
  className,
  dialogTitle = "Talk to a hosting expert",
  dialogDescription = "Share a few details and our team will get back to you shortly.",
  defaultService,
}: LeadCTAButtonProps) {
  const [open, setOpen] = useState(false)
  // Once true, stays true — keeps the dialog mounted after first open so close
  // transitions still play, while deferring its bundle until actually needed.
  const [hasOpened, setHasOpened] = useState(false)

  return (
    <>
      <CTAButton
        type="button"
        variant={variant}
        size={size}
        icon={icon}
        iconPosition={iconPosition}
        className={className}
        onClick={() => {
          setHasOpened(true)
          setOpen(true)
        }}
      >
        {children}
      </CTAButton>

      {hasOpened ? (
        <LeadDialog
          open={open}
          onOpenChange={setOpen}
          source={source}
          dialogTitle={dialogTitle}
          dialogDescription={dialogDescription}
          defaultService={defaultService}
        />
      ) : null}
    </>
  )
}
