"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { TextField } from "@/components/forms/fields/text-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { cn } from "@/lib/utils"
import { leadFormDefaultValues, leadFormSchema, type LeadFormValues } from "@/schemas/lead-form.schema"

type LeadFormResult = {
  success: boolean
  message: string
}

type LeadFormProps = {
  source: string
  onSuccess?: () => void
  submitLabel?: string
  className?: string
}

function filterNameInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/[^A-Za-z\s]/g, "")
}

function filterPhoneInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10)
}

export function LeadForm({ source, onSuccess, submitLabel = "Send my details", className }: LeadFormProps) {
  const [result, setResult] = useState<LeadFormResult | null>(null)
  const [formRenderedAt] = useState(() => Date.now())

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaultValues,
  })

  const onSubmit = async (values: LeadFormValues) => {
    setResult(null)

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source, formRenderedAt }),
      })

      const data: { success?: boolean; message?: string } = await response.json().catch(() => ({}))
      const success = Boolean(data.success)

      setResult({
        success,
        message: data.message ?? (success ? "Thanks — we'll be in touch shortly." : "Something went wrong. Please try again."),
      })

      if (success) {
        reset()
        onSuccess?.()
      }
    } catch {
      setResult({ success: false, message: "Network error — please check your connection and try again." })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-4", className)} noValidate>
      <TextField
        label="Full name"
        required
        placeholder="Abhishek Patil"
        autoComplete="name"
        registration={register("name", { onChange: filterNameInput })}
        error={errors.name?.message}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Phone number"
          type="tel"
          required
          placeholder="9876543210"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          registration={register("phone", { onChange: filterPhoneInput })}
          error={errors.phone?.message}
        />
        <TextField
          label="Email address"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          registration={register("email")}
          error={errors.email?.message}
        />
      </div>
      <TextareaField
        label="Message (optional)"
        rows={4}
        placeholder="Tell us how we can help…"
        registration={register("message")}
        error={errors.message?.message}
      />

      {/* Honeypot — invisible to real users, silently flags automated submissions. */}
      <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="lead-company">Company</label>
        <input id="lead-company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {result ? <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} /> : null}

      <FormSubmitButton isSubmitting={isSubmitting}>{submitLabel}</FormSubmitButton>

      <p className="text-center text-xs text-muted-foreground">
        By submitting, you agree to be contacted about your enquiry. We don&apos;t share your details with third parties.
      </p>
    </form>
  )
}
