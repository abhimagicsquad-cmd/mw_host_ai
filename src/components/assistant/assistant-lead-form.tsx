"use client"

import { useId, useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import { TurnstileWidget, useTurnstile, TURNSTILE_MISSING_MESSAGE } from "@/components/forms/turnstile-widget"
import { LEAD_CONTACT_FALLBACK, toNationalPhone } from "@/lib/lead-form-utils"

export type LeadDetails = { name: string; email: string; phone: string; requirement: string; service: string }
export type LeadSubmitter = (lead: LeadDetails, extras: { turnstileToken: string | null; formRenderedAt: number; website: string }) => Promise<{ ok: boolean; message: string }>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Mirrors the /api/leads rules (src/schemas/shared.ts) so errors show before sending. */
function validate(values: Omit<LeadDetails, "service">) {
  const errors: Partial<Record<keyof typeof values, string>> = {}
  const name = values.name.trim()
  if (name.length < 2) errors.name = "Please enter your full name."
  else if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(name)) errors.name = "Name can only contain letters and spaces."
  if (!EMAIL.test(values.email.trim())) errors.email = "Please enter a valid email address."
  if (!/^\d{10}$/.test(values.phone)) errors.phone = "Enter a valid 10-digit phone number."
  const requirement = values.requirement.trim()
  if (requirement.length < 5) errors.requirement = "Tell us briefly what you need."
  else if (requirement.length > 1000) errors.requirement = "Please keep it under 1000 characters."
  return errors
}

export function AssistantLeadForm({
  service,
  requirement: initialRequirement = "",
  sent,
  onSubmit,
  onSent,
  useCaptcha,
}: {
  service: string
  requirement?: string
  sent: boolean
  onSubmit: LeadSubmitter
  onSent: () => void
  useCaptcha: boolean
}) {
  const id = useId()
  const [values, setValues] = useState({ name: "", email: "", phone: "", requirement: initialRequirement })
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({})
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, setPending] = useState(false)
  const [renderedAt] = useState(() => Date.now())
  const [website, setWebsite] = useState("")
  const turnstile = useTurnstile()

  if (sent) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
        Thanks! Your details were sent. Our team will contact you shortly.
      </p>
    )
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return
    if (useCaptcha && turnstile.missing) {
      setStatus({ ok: false, message: TURNSTILE_MISSING_MESSAGE })
      return
    }
    setPending(true)
    try {
      const result = await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim(), requirement: values.requirement.trim(), service }, { turnstileToken: turnstile.token, formRenderedAt: renderedAt, website })
      if (useCaptcha) turnstile.consume()
      setStatus(result)
      if (result.ok) onSent()
    } catch {
      setStatus({ ok: false, message: `Something went wrong sending your details. ${LEAD_CONTACT_FALLBACK}` })
    } finally {
      setPending(false)
    }
  }

  const field = "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 outline-none focus-visible:border-[var(--aw-primary)] focus-visible:ring-2 focus-visible:ring-[var(--aw-primary)]/25"
  const error = (key: keyof typeof errors) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="mt-0.5 text-[11px] text-red-700">
        {errors[key]}
      </p>
    ) : null
  const describedBy = (key: keyof typeof errors) => (errors[key] ? `${id}-${key}-error` : undefined)

  return (
    <form onSubmit={submit} noValidate className="relative flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3" aria-label="Contact our team">
      <div>
        <label htmlFor={`${id}-name`} className="text-[12px] font-medium text-slate-700">
          Name <span aria-hidden>*</span>
        </label>
        <input
          id={`${id}-name`}
          className={field}
          autoComplete="name"
          required
          maxLength={80}
          value={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy("name")}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value.replace(/[^A-Za-z\s]/g, "") }))}
        />
        {error("name")}
      </div>
      <div>
        <label htmlFor={`${id}-email`} className="text-[12px] font-medium text-slate-700">
          Email <span aria-hidden>*</span>
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          className={field}
          autoComplete="email"
          required
          maxLength={120}
          value={values.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email")}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        {error("email")}
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className="text-[12px] font-medium text-slate-700">
          Phone <span aria-hidden>*</span>
        </label>
        <input
          id={`${id}-phone`}
          type="tel"
          inputMode="numeric"
          className={field}
          autoComplete="tel"
          required
          maxLength={16}
          value={values.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy("phone")}
          onChange={(e) => setValues((v) => ({ ...v, phone: toNationalPhone(e.target.value) }))}
        />
        {error("phone")}
      </div>
      <div>
        <label htmlFor={`${id}-req`} className="text-[12px] font-medium text-slate-700">
          Requirement <span aria-hidden>*</span>
        </label>
        <textarea
          id={`${id}-req`}
          rows={3}
          className={`${field} resize-none`}
          required
          maxLength={1000}
          value={values.requirement}
          aria-invalid={Boolean(errors.requirement)}
          aria-describedby={describedBy("requirement")}
          onChange={(e) => setValues((v) => ({ ...v, requirement: e.target.value }))}
        />
        {error("requirement")}
      </div>
      {/* Honeypot, as on the site's other forms. */}
      <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
        <input tabIndex={-1} autoComplete="new-password" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {useCaptcha ? <TurnstileWidget {...turnstile.widgetProps} /> : null}
      {status ? (
        <p role={status.ok ? "status" : "alert"} className={status.ok ? "text-[12px] text-emerald-800" : "text-[12px] text-red-700"}>
          {status.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--aw-primary)] px-3 py-2 text-[13px] font-semibold text-[var(--aw-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {pending ? "Sending…" : "Send to our team"}
      </button>
    </form>
  )
}
