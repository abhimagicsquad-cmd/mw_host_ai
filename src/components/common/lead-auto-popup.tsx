"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const LeadDialog = dynamic(() => import("@/components/common/lead-dialog").then((mod) => mod.LeadDialog), {
  ssr: false,
})

const SESSION_KEY = "mwh:lead-auto-popup-shown"
/** Share of the page scrolled before the dialog opens — the visitor has read past the fold. */
const SCROLL_DEPTH = 0.5

function hasBeenShown() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
    // Storage blocked (e.g. strict privacy mode) — treat as shown rather than risk repeat popups.
    return true
  }
}

function markShown() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    // Ignore — see hasBeenShown().
  }
}

/** True while the visitor is typing in a field — never interrupt that with a dialog. */
function isTyping() {
  const active = document.activeElement
  return active instanceof HTMLElement && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))
}

/**
 * Opens the shared lead dialog once per browser session, on engagement rather than a timer:
 * when the visitor has scrolled through half the page, or (mouse users) moves the pointer
 * out through the top of the window to leave. A timed popup interrupts people mid-read,
 * steals focus from keyboard and screen-reader users and counts as an intrusive
 * interstitial on mobile. Mounted in the site layout so it persists across client-side
 * navigations.
 */
export function LeadAutoPopup() {
  const [open, setOpen] = useState(false)
  // Same mount-on-first-open pattern as <LeadCTAButton /> — defers the dialog bundle.
  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    if (hasBeenShown()) return

    let frame = 0
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll)
      document.documentElement.removeEventListener("mouseleave", onExitIntent)
      window.cancelAnimationFrame(frame)
    }
    const trigger = () => {
      // Don't stack on a dialog the visitor already opened (lead CTA, mobile nav, etc.) or
      // interrupt typing — wait for the next trigger instead.
      if (document.querySelector('[role="dialog"]') || isTyping()) return
      cleanup()
      markShown()
      setHasOpened(true)
      setOpen(true)
    }
    const onScroll = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const { scrollHeight } = document.documentElement
        if (window.scrollY + window.innerHeight >= scrollHeight * SCROLL_DEPTH && window.scrollY > 0) trigger()
      })
    }
    const onExitIntent = (event: MouseEvent) => {
      if (event.clientY <= 0) trigger()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.documentElement.addEventListener("mouseleave", onExitIntent)
    }
    return cleanup
  }, [])

  if (!hasOpened) return null

  return (
    <LeadDialog
      open={open}
      onOpenChange={setOpen}
      source="auto-popup"
      dialogTitle="Talk to a hosting expert"
      dialogDescription="Share a few details and our team will get back to you shortly."
    />
  )
}
