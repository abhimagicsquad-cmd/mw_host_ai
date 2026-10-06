"use client"

import { Power, PowerOff } from "lucide-react"

import { setAssistantEnabledAction } from "@/lib/admin/actions/assistant"
import { cn } from "@/lib/utils"

import { ConfirmActionButton } from "../form-controls"

/** The prominent ON/OFF card at the top of Admin → Hosting Assistant. */
export function AssistantStatusToggle({ enabled, preview }: { enabled: boolean; preview?: React.ReactNode }) {
  return (
    <section
      aria-labelledby="assistant-status-heading"
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between",
        enabled ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10" : "border-border bg-muted/40"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            enabled ? "bg-emerald-600 text-white" : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          {enabled ? <Power className="size-5" aria-hidden /> : <PowerOff className="size-5" aria-hidden />}
        </span>
        <div>
          <h2 id="assistant-status-heading" className="text-base font-semibold">
            Hosting Assistant Status
          </h2>
          <p className="mt-0.5 text-sm">
            <span
              className={cn(
                "mr-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide",
                enabled ? "bg-emerald-600 text-white" : "bg-foreground/80 text-background"
              )}
            >
              {enabled ? "ON" : "OFF"}
            </span>
            {enabled ? "Visible on the website — visitors can chat with it now." : "Hidden — the chat widget isn't shown or loaded on the website."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {preview}
        <ConfirmActionButton
          variant={enabled ? "outline" : "default"}
          action={() => setAssistantEnabledAction(!enabled)}
          title={enabled ? "Disable the Hosting Assistant?" : "Enable the Hosting Assistant?"}
          description={
            enabled
              ? "The chat widget disappears from every page of the website immediately. Settings, FAQs, plans and conversations are kept."
              : "The chat widget appears on the website immediately (on the pages chosen in Settings). Use Preview first to check it."
          }
          confirmLabel={enabled ? "Disable chatbot" : "Enable chatbot"}
          destructive={enabled}
        >
          {enabled ? <PowerOff /> : <Power />}
          {enabled ? "Disable Chatbot" : "Enable Chatbot"}
        </ConfirmActionButton>
      </div>
    </section>
  )
}

/** Shown on every Hosting Assistant screen until migration 0006 has been run. */
export function AssistantMigrationNotice() {
  return (
    <p role="status" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
      The Hosting Assistant&apos;s tables aren&apos;t set up yet. Run <code className="font-mono text-xs">supabase/migrations/0006_create_hosting_assistant.sql</code> in the Supabase SQL
      editor to enable FAQs, plans, stored conversations and analytics. Settings, the ON/OFF switch and the recommendation flow already work.
    </p>
  )
}
