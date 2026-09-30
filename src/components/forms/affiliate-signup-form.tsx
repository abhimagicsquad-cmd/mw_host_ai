"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { TextField } from "@/components/forms/fields/text-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TURNSTILE_MISSING_MESSAGE, TurnstileWidget, useTurnstile } from "@/components/forms/turnstile-widget"
import { AFFILIATE_SERVICE_VALUE } from "@/schemas/lead-form.schema"
import { affiliateSignupDefaultValues, affiliateSignupSchema, type AffiliateSignupValues } from "@/schemas/affiliate-signup.schema"

function lettersOnly(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/[^A-Za-z\s]/g, "")
}

function digitsOnly(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10)
}

/**
 * The WordPress affiliate signup ("Proceed to Registration"): first/last name, email and mobile.
 * Submitted through the lead pipeline (/api/leads) tagged as an affiliate application, then the
 * visitor lands on the affiliate thank-you page, which links to the client-area registration.
 */
export function AffiliateSignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [formRenderedAt] = useState(() => Date.now())
  const turnstile = useTurnstile()
  const honeypotId = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AffiliateSignupValues>({ resolver: zodResolver(affiliateSignupSchema), defaultValues: affiliateSignupDefaultValues })

  const onSubmit = async (values: AffiliateSignupValues) => {
    setError(null)
    if (turnstile.missing) {
      setError(TURNSTILE_MISSING_MESSAGE)
      return
    }
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          phone: values.phone,
          service: AFFILIATE_SERVICE_VALUE,
          message: "Affiliate programme application",
          website: values.website,
          source: "affiliate-signup",
          formRenderedAt,
          pageUrl: window.location.href,
          turnstileToken: turnstile.token,
        }),
      })
      turnstile.consume()
      const data: { success?: boolean; message?: string } = await response.json().catch(() => ({}))
      if (data.success) {
        reset()
        router.push("/thank-you-for-interest-in-affiliate-program/")
        return
      }
      setError(data.message ?? "Something went wrong. Please try again.")
    } catch {
      setError("Network error — please check your connection and try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-4" noValidate aria-label="Affiliate programme signup">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" required placeholder="First Name *" autoComplete="given-name" registration={register("firstName", { onChange: lettersOnly })} error={errors.firstName?.message} />
        <TextField label="Last name" required placeholder="Last Name *" autoComplete="family-name" registration={register("lastName", { onChange: lettersOnly })} error={errors.lastName?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email address" type="email" required placeholder="Email Address *" autoComplete="email" registration={register("email")} error={errors.email?.message} />
        <TextField
          label="Mobile number"
          type="tel"
          required
          placeholder="Mobile Number *"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          registration={register("phone", { onChange: digitsOnly })}
          error={errors.phone?.message}
        />
      </div>

      <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <TurnstileWidget {...turnstile.widgetProps} />

      {error ? <FormStatusMessage status="error" message={error} /> : null}

      <FormSubmitButton isSubmitting={isSubmitting}>Proceed to Registration</FormSubmitButton>

      <p className="text-center text-xs text-muted-foreground">After you submit, you&apos;ll continue to the final registration in our client area.</p>
    </form>
  )
}
