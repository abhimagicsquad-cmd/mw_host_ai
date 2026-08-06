"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { SelectField } from "@/components/forms/fields/select-field"
import { TextField } from "@/components/forms/fields/text-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { mockSubmit, type MockSubmitResult } from "@/lib/mock-submit"
import {
  getQuoteFormDefaultValues,
  getQuoteFormSchema,
  serviceOptions,
  type GetQuoteFormValues,
} from "@/schemas/get-quote-form.schema"

export function GetQuoteForm() {
  const [result, setResult] = useState<MockSubmitResult | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GetQuoteFormValues>({
    resolver: zodResolver(getQuoteFormSchema),
    defaultValues: getQuoteFormDefaultValues,
  })

  const onSubmit = async (values: GetQuoteFormValues) => {
    const response = await mockSubmit(values)
    setResult(response)
    if (response.success) reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" required registration={register("name")} error={errors.name?.message} />
        <TextField
          label="Email address"
          type="email"
          required
          registration={register("email")}
          error={errors.email?.message}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Phone number"
          type="tel"
          required
          registration={register("phone")}
          error={errors.phone?.message}
        />
        <TextField label="Company (optional)" registration={register("company")} error={errors.company?.message} />
      </div>
      <SelectField
        name="service"
        control={control}
        label="Service you're interested in"
        required
        placeholder="Select a service"
        options={serviceOptions}
        error={errors.service?.message}
      />
      <TextareaField
        label="Requirements"
        required
        rows={5}
        placeholder="Storage, traffic, budget, timeline — anything that helps us quote accurately."
        registration={register("requirements")}
        error={errors.requirements?.message}
      />

      {result ? (
        <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} />
      ) : null}

      <FormSubmitButton isSubmitting={isSubmitting}>Request a quote</FormSubmitButton>
    </form>
  )
}
