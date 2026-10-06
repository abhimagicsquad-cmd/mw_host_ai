"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { Loader2, MessageCircle, X } from "lucide-react"

import { pathMatches } from "@/lib/assistant/settings"
import type { AssistantResponse, PublicAssistantConfig } from "@/lib/assistant/types"
import { trackConversion } from "@/lib/analytics"
import { markLeadAutoPopupShown } from "@/lib/lead-form-utils"
import { cn } from "@/lib/utils"

import type { AssistantTransport } from "./assistant-panel"
import { getVisitorId } from "./session"
import { assistantStyle } from "./style"

// The chat UI loads only when a visitor first opens it, so pages don't pay for it up front.
const AssistantPanel = dynamic(() => import("./assistant-panel").then((mod) => mod.AssistantPanel), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
      <Loader2 className="size-6 animate-spin text-slate-400" aria-label="Loading chat" />
    </div>
  ),
})

const OPEN_KEY = "mwh:assistant-open"
const AUTO_KEY = "mwh:assistant-auto-opened"
const STORAGE_KEY = "mwh-assistant"

const readFlag = (key: string) => {
  try {
    return window.sessionStorage.getItem(key) === "1"
  } catch {
    return false
  }
}
const writeFlag = (key: string, on: boolean) => {
  try {
    if (on) window.sessionStorage.setItem(key, "1")
    else window.sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

function liveTransport(): AssistantTransport {
  const visitorId = getVisitorId()
  return {
    async send({ event, conversationId, state }) {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, conversationId, event, state: state ?? undefined, pageUrl: window.location.href }),
      })
      const data = (await response.json().catch(() => null)) as AssistantResponse | null
      if (!data) throw new Error("Bad response")
      return data
    },
    // The enquiry went through the normal lead pipeline: count the conversion like the other lead forms do.
    onLeadSent() {
      markLeadAutoPopupShown()
      trackConversion("lead")
    },
  }
}

/** Floating launcher + window for the Hosting Assistant on the public website. */
export function AssistantLauncher({ config }: { config: PublicAssistantConfig }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const transport = useMemo(() => (mounted ? liveTransport() : null), [mounted])

  // Browser-only state (session flags, the public path behind rewrites) is read after mount.
  useEffect(() => {
    const reopen = readFlag(OPEN_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with browser storage after hydration
    setMounted(true)
    if (reopen) {
      setOpen(true)
      setLoaded(true)
    }
  }, [])

  const visible = mounted && (config.visibility === "all" || pathMatches(typeof window !== "undefined" ? window.location.pathname : pathname, config.pages))

  const setOpenState = useCallback((next: boolean) => {
    setOpen(next)
    if (next) setLoaded(true)
    writeFlag(OPEN_KEY, next)
  }, [])

  // Auto-open once per browser session, after the configured delay.
  useEffect(() => {
    if (!visible || !config.autoOpenSeconds || readFlag(AUTO_KEY)) return
    const timer = window.setTimeout(() => {
      writeFlag(AUTO_KEY, true)
      if (!document.querySelector('[role="dialog"]')) setOpenState(true)
    }, config.autoOpenSeconds * 1000)
    return () => window.clearTimeout(timer)
  }, [visible, config.autoOpenSeconds, setOpenState])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenState(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, setOpenState])

  if (!visible || !transport) return null
  const left = config.position === "bottom-left"

  return (
    <div style={assistantStyle(config)} className="print:hidden">
      <div
        role={open ? "dialog" : undefined}
        aria-label={`${config.brandName} chat`}
        inert={!open}
        className={cn(
          "fixed z-50 transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none",
          // Phones: nearly full screen. Larger screens: a 380px window above the launcher.
          "inset-x-2 bottom-2 h-[min(640px,calc(100dvh-1rem))] sm:inset-x-auto sm:bottom-24 sm:h-[min(620px,calc(100dvh-8rem))] sm:w-[380px]",
          left ? "sm:left-6" : "sm:right-6",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        {loaded ? <AssistantPanel config={config} transport={transport} storageKey={STORAGE_KEY} onMinimize={() => setOpenState(false)} active={open} /> : null}
      </div>

      <button
        type="button"
        onClick={() => setOpenState(!open)}
        aria-expanded={open}
        aria-label={open ? "Minimize chat" : `Chat with ${config.brandName}`}
        className={cn(
          "fixed bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-[var(--aw-primary)] text-[var(--aw-on-primary)] shadow-lg ring-4 ring-white/70 transition-transform duration-200 hover:scale-105 focus-visible:ring-[var(--aw-secondary)] focus-visible:outline-none sm:bottom-6",
          // Bottom-left sits clear of the WhatsApp / call buttons.
          left ? "left-20 sm:left-24" : "right-4 sm:right-6",
          open && "max-sm:hidden"
        )}
      >
        {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
        {!open ? <span className="absolute top-1 right-1 size-3 rounded-full bg-[var(--aw-secondary)] ring-2 ring-white" aria-hidden /> : null}
      </button>
    </div>
  )
}
