"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { TextField } from "@/components/forms/fields/text-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { mockSubmit, type MockSubmitResult } from "@/lib/mock-submit"
import {
  quickInquiryFormDefaultValues,
  quickInquiryFormSchema,
  type QuickInquiryFormValues,
} from "@/schemas/quick-inquiry-form.schema"

export function QuickInquiryForm() {
  const [result, setResult] = useState<MockSubmitResult | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickInquiryFormValues>({
    resolver: zodResolver(quickInquiryFormSchema),
    defaultValues: quickInquiryFormDefaultValues,
  })

  const onSubmit = async (values: QuickInquiryFormValues) => {
    const response = await mockSubmit(values)
    setResult(response)
    if (response.success) reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <TextField label="Name" required registration={register("name")} error={errors.name?.message} />
      <TextField
        label="Email"
        type="email"
        required
        registration={register("email")}
        error={errors.email?.message}
      />
      <TextField
        label="Phone"
        type="tel"
        required
        registration={register("phone")}
        error={errors.phone?.message}
      />
      <TextareaField
        label="What do you need?"
        required
        rows={3}
        registration={register("message")}
        error={errors.message?.message}
      />

      {result ? (
        <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} />
      ) : null}

      <FormSubmitButton isSubmitting={isSubmitting}>Get in touch</FormSubmitButton>
    </form>
  )
}
