"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const LeadDialog = dynamic(() => import("@/components/common/lead-dialog").then((mod) => mod.LeadDialog), {
  ssr: false,
})

const SESSION_KEY = "mwh:lead-auto-popup-shown"
const DELAY_MS = 4000

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

/**
 * Opens the shared lead dialog once per browser session, 4s after the first page load.
 * Mounted in the site layout so it persists across client-side navigations.
 */
export function LeadAutoPopup() {
  const [open, setOpen] = useState(false)
  // Same mount-on-first-open pattern as <LeadCTAButton /> — defers the dialog bundle.
  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    if (hasBeenShown()) return

    const timer = window.setTimeout(() => {
      markShown()
      // Don't stack on top of a dialog the visitor already opened (lead CTA, mobile nav, etc.).
      if (document.querySelector('[role="dialog"]')) return
      setHasOpened(true)
      setOpen(true)
    }, DELAY_MS)

    return () => window.clearTimeout(timer)
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
