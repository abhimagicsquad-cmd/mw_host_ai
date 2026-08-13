"use client"

import { useId, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CheckCircle2, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { newsletterFormDefaultValues, newsletterFormSchema, type NewsletterFormValues } from "@/schemas/newsletter-form.schema"

type NewsletterSectionProps = {
  className?: string
}

export function NewsletterSection({ className }: NewsletterSectionProps) {
  const emailId = useId()
  const honeypotId = useId()
  const [formRenderedAt] = useState(() => Date.now())
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: newsletterFormDefaultValues,
  })

  const onSubmit = async (values: NewsletterFormValues) => {
    setStatus("idle")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          website: values.website,
          source: "footer-newsletter",
          formRenderedAt,
          pageUrl: window.location.href,
        }),
      })

      const data: { success?: boolean; message?: string } = await response.json().catch(() => ({}))

      if (data.success) {
        setStatus("success")
        reset()
        return
      }

      setStatus("error")
      setErrorMessage(data.message ?? "Something went wrong. Please try again.")
    } catch {
      setStatus("error")
      setErrorMessage("Network error — please check your connection and try again.")
    }
  }

  if (status === "success") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-white/80", className)}>
        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
        You&apos;re subscribed — thanks for joining!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={className}>
      <label htmlFor={emailId} className="text-sm font-semibold text-white">
        Get hosting tips in your inbox
      </label>
      <p className="mt-1 text-xs text-white/60">Uptime advisories and the occasional offer. No spam, unsubscribe anytime.</p>

      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
          <Input
            id={emailId}
            type="email"
            placeholder="you@yourbusiness.com"
            aria-invalid={Boolean(errors.email)}
            className="border-white/15 bg-white/5 pl-9 text-white placeholder:text-white/40"
            {...register("email")}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="shrink-0 rounded-full bg-brand-orange text-white hover:bg-brand-orange-hover">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>

      {/* Honeypot — invisible to real users, silently flags automated submissions. */}
      <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {errors.email ? <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p> : null}
      {status === "error" ? <p className="mt-1.5 text-xs text-red-300">{errorMessage}</p> : null}
    </form>
  )
}
