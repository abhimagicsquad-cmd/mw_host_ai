"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { SelectField } from "@/components/forms/fields/select-field"
import { TextField } from "@/components/forms/fields/text-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { mockSubmit, type MockSubmitResult } from "@/lib/mock-submit"
import {
  callbackRequestFormDefaultValues,
  callbackRequestFormSchema,
  preferredTimeOptions,
  type CallbackRequestFormValues,
} from "@/schemas/callback-request-form.schema"

export function CallbackRequestForm() {
  const router = useRouter()
  const [result, setResult] = useState<MockSubmitResult | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CallbackRequestFormValues>({
    resolver: zodResolver(callbackRequestFormSchema),
    defaultValues: callbackRequestFormDefaultValues,
  })

  const onSubmit = async (values: CallbackRequestFormValues) => {
    const response = await mockSubmit(values)
    if (response.success) {
      reset()
      router.push("/thank-you")
      return
    }
    setResult(response)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="Full name" required placeholder="Full Name *" registration={register("name")} error={errors.name?.message} />
      <TextField
        label="Phone number"
        type="tel"
        required
        placeholder="Phone Number *"
        registration={register("phone")}
        error={errors.phone?.message}
      />
      <SelectField
        name="preferredTime"
        control={control}
        label="Preferred callback time"
        required
        placeholder="Preferred Callback Time *"
        options={preferredTimeOptions}
        error={errors.preferredTime?.message}
      />
      <TextareaField
        label="What's this about? (optional)"
        placeholder="What's This About?"
        rows={3}
        registration={register("reason")}
        error={errors.reason?.message}
      />

      {result ? (
        <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} />
      ) : null}

      <FormSubmitButton isSubmitting={isSubmitting}>Request a callback</FormSubmitButton>
    </form>
  )
}
