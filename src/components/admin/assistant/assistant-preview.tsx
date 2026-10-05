"use client"

import { useMemo, useState } from "react"
import { Eye } from "lucide-react"

import { assistantStyle } from "@/components/assistant/style"
import { AssistantPanel, type AssistantTransport } from "@/components/assistant/assistant-panel"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { previewAssistantAction, previewLeadAction } from "@/lib/admin/actions/assistant"
import type { PublicAssistantConfig } from "@/lib/assistant/types"

/**
 * "Preview Chatbot": the real widget inside the dashboard, using the saved settings, FAQs and
 * plans. Replies come from the same engine through a server action; nothing is stored and
 * enquiries are validated but not sent.
 */
export function AssistantPreviewButton({ config }: { config: PublicAssistantConfig }) {
  const [open, setOpen] = useState(false)
  const transport = useMemo<AssistantTransport>(
    () => ({
      captcha: false,
      send: ({ event }) => previewAssistantAction(event),
      submitLead: () => (lead) => previewLeadAction(lead),
    }),
    []
  )

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Eye />
        Preview Chatbot
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(720px,calc(100dvh-2rem))] flex-col gap-3 sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Preview: {config.brandName}</DialogTitle>
            <DialogDescription>Uses the saved settings. Nothing is stored, and test enquiries aren&apos;t sent.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1" style={assistantStyle(config)}>
            <AssistantPanel config={config} transport={transport} storageKey="mwh-assistant-preview" embedded />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
