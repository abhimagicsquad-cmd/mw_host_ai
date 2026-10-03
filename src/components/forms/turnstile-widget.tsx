"use client"

import { useEffect, useRef, useState } from "react"

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<void> | null = null

function loadScript() {
  if (window.turnstile) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Turnstile failed to load"))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** Whether forms should require a Turnstile token before submitting. */
export const turnstileEnabled = Boolean(SITE_KEY)

/** Token state for a form: spread `widgetProps` onto <TurnstileWidget />, send `token`, and call `consume()` after each submit (tokens are single-use). */
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)
  return {
    token,
    missing: turnstileEnabled && !token,
    widgetProps: { onToken: setToken, resetKey },
    consume: () => {
      setToken(null)
      setResetKey((key) => key + 1)
    },
  }
}

export const TURNSTILE_MISSING_MESSAGE = "Please complete the security check above."

type TurnstileWidgetProps = {
  /** Receives the token when the challenge passes, and null when it expires or errors. */
  onToken: (token: string | null) => void
  /** Change this value to reset the widget (e.g. after a failed submission) and get a fresh token. */
  resetKey?: number
}

/**
 * Cloudflare Turnstile challenge (usually invisible to real visitors). Renders nothing until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, and the script only loads on pages that show a form.
 */
export function TurnstileWidget({ onToken, resetKey = 0 }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)

  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return
    const container = containerRef.current
    let widgetId: string | null = null
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return
        widgetId = window.turnstile.render(container, {
          sitekey: SITE_KEY,
          size: "flexible",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        })
      })
      .catch(() => onTokenRef.current(null))

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [resetKey])

  if (!SITE_KEY) return null
  return <div ref={containerRef} className="min-h-[65px]" />
}
