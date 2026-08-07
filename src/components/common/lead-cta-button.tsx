"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { LeadForm } from "@/components/forms/lead-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

  return (
    <>
      <CTAButton
        type="button"
        variant={variant}
        size={size}
        icon={icon}
        iconPosition={iconPosition}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </CTAButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <LeadForm source={source} onSuccess={() => setOpen(false)} defaultService={defaultService} />
        </DialogContent>
      </Dialog>
    </>
  )
}
