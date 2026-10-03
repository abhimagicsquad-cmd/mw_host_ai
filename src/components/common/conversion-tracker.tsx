"use client"

import { useEffect } from "react"

import { trackConversion, type ConversionKind } from "@/lib/analytics"

/** Fires a Google Ads conversion once when the page it's rendered on loads (thank-you pages). */
export function ConversionTracker({ kind }: { kind: ConversionKind }) {
  useEffect(() => {
    trackConversion(kind)
  }, [kind])

  return null
}
