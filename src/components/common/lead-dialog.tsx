"use client"

import { LeadForm } from "@/components/forms/lead-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type LeadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: string
  dialogTitle: string
  dialogDescription: string
  defaultService?: string
}

export function LeadDialog({ open, onOpenChange, source, dialogTitle, dialogDescription, defaultService }: LeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <LeadForm source={source} onSuccess={() => onOpenChange(false)} defaultService={defaultService} />
      </DialogContent>
    </Dialog>
  )
}
