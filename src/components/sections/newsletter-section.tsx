"use client"

import { useId, useState } from "react"
import { CheckCircle2, Loader2, Mail } from "lucide-react"

import { TURNSTILE_MISSING_MESSAGE, TurnstileWidget, useTurnstile } from "@/components/forms/turnstile-widget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { trackConversion } from "@/lib/analytics"
import { cn } from "@/lib/utils"

type NewsletterSectionProps = {
  className?: string
}

// Same rule as the server's schema (/api/newsletter re-validates with zod). Kept dependency-free
// because this form is in every page's footer: react-hook-form + zod would otherwise ship on
// every page just for one email field.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string) {
  const email = value.trim()
  if (!email) return "Email is required."
  if (!EMAIL_PATTERN.test(email)) return "Please enter a valid email address."
  return null
}

export function NewsletterSection({ className }: NewsletterSectionProps) {
  const emailId = useId()
  const errorId = useId()
  const honeypotId = useId()
  const [formRenderedAt] = useState(() => Date.now())
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const turnstile = useTurnstile()
  // The challenge script only loads once someone starts filling in the form.
  const [challengeArmed, setChallengeArmed] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("idle")
    const invalid = validateEmail(email)
    setFieldError(invalid)
    if (invalid) return
    if (turnstile.missing) {
      setChallengeArmed(true)
      setStatus("error")
      setErrorMessage(TURNSTILE_MISSING_MESSAGE.replace("above", "below"))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website,
          source: "footer-newsletter",
          formRenderedAt,
          pageUrl: window.location.href,
          turnstileToken: turnstile.token,
        }),
      })
      turnstile.consume()

      const data: { success?: boolean; message?: string } = await response.json().catch(() => ({}))

      if (data.success) {
        // WordPress sent subscribers to a thank-you page that fired this conversion.
        trackConversion("lead")
        setStatus("success")
        setEmail("")
        return
      }

      setStatus("error")
      setErrorMessage(data.message ?? "Something went wrong. Please try again.")
    } catch {
      setStatus("error")
      setErrorMessage("Network error — please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "success") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-white/80", className)} role="status">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
        You&apos;re subscribed — thanks for joining!
      </div>
    )
  }

  const message = fieldError ?? (status === "error" ? errorMessage : null)

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <label htmlFor={emailId} className="text-sm font-semibold text-white">
        Get hosting tips in your inbox
      </label>
      <p className="mt-1 text-xs text-white/60">Uptime advisories and the occasional offer. No spam, unsubscribe anytime.</p>

      <div className="mt-3 flex gap-2 lg:flex-col xl:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (fieldError) setFieldError(null)
            }}
            onFocus={() => setChallengeArmed(true)}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={message ? errorId : undefined}
            className="border-white/15 bg-white/5 pl-9 text-white placeholder:text-white/40"
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="shrink-0 rounded-full bg-brand-orange text-white hover:bg-brand-orange-hover">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-label="Subscribing" /> : "Subscribe"}
        </Button>
      </div>

      {/* Honeypot — invisible to real users, silently flags automated submissions. */}
      <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>

      {challengeArmed ? (
        <div className="mt-3">
          <TurnstileWidget {...turnstile.widgetProps} />
        </div>
      ) : null}

      {message ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-300">
          {message}
        </p>
      ) : null}
    </form>
  )
}
