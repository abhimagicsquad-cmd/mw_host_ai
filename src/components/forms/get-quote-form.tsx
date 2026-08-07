"use client"

import { useId, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import { SelectField } from "@/components/forms/fields/select-field"
import { TextField } from "@/components/forms/fields/text-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { hostingRelatedServiceValues, hostingTypeOptions, serviceOptions } from "@/constants/service-options"
import {
  getQuoteFormDefaultValues,
  getQuoteFormSchema,
  type GetQuoteFormValues,
} from "@/schemas/get-quote-form.schema"

type SubmitResult = { success: boolean; message: string }

type GetQuoteFormProps = {
  source?: string
  defaultService?: string
  onSuccess?: () => void
}

function filterNameInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/[^A-Za-z\s]/g, "")
}

function filterPhoneInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10)
}

export function GetQuoteForm({ source = "get-quote-form", defaultService, onSuccess }: GetQuoteFormProps) {
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [formRenderedAt] = useState(() => Date.now())
  const honeypotId = useId()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GetQuoteFormValues>({
    resolver: zodResolver(getQuoteFormSchema),
    defaultValues: { ...getQuoteFormDefaultValues, service: defaultService ?? "" },
  })

  const selectedService = useWatch({ control, name: "service" })
  const showHostingType = hostingRelatedServiceValues.includes(
    selectedService as (typeof hostingRelatedServiceValues)[number]
  )

  const onSubmit = async (values: GetQuoteFormValues) => {
    setResult(null)

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          company: values.company,
          service: values.service,
          hostingType: showHostingType ? values.hostingType : "",
          message: values.requirements,
          website: values.website,
          source,
          formRenderedAt,
        }),
      })

      const data: { success?: boolean; message?: string } = await response.json().catch(() => ({}))
      const success = Boolean(data.success)

      setResult({
        success,
        message: data.message ?? (success ? "Thanks — we'll follow up with a quote shortly." : "Something went wrong. Please try again."),
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          required
          autoComplete="name"
          registration={register("name", { onChange: filterNameInput })}
          error={errors.name?.message}
        />
        <TextField
          label="Email address"
          type="email"
          required
          autoComplete="email"
          registration={register("email")}
          error={errors.email?.message}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Phone number"
          type="tel"
          required
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          registration={register("phone", { onChange: filterPhoneInput })}
          error={errors.phone?.message}
        />
        <TextField label="Company (optional)" registration={register("company")} error={errors.company?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="service"
          control={control}
          label="Service you're interested in"
          required
          placeholder="Select a service"
          options={serviceOptions}
          error={errors.service?.message}
        />
        {showHostingType ? (
          <SelectField
            name="hostingType"
            control={control}
            label="Hosting type"
            placeholder="Select a tier"
            options={hostingTypeOptions}
            error={errors.hostingType?.message}
          />
        ) : null}
      </div>
      <TextareaField
        label="Requirements"
        required
        rows={5}
        placeholder="Storage, traffic, budget, timeline — anything that helps us quote accurately."
        registration={register("requirements")}
        error={errors.requirements?.message}
      />

      {/* Honeypot — invisible to real users, silently flags automated submissions. */}
      <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {result ? (
        <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} />
      ) : null}

      <FormSubmitButton isSubmitting={isSubmitting}>Request a quote</FormSubmitButton>
    </form>
  )
}
