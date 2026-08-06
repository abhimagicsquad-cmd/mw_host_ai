"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { CheckboxField } from "@/components/forms/fields/checkbox-field"
import { TextField } from "@/components/forms/fields/text-field"
import { TextareaField } from "@/components/forms/fields/textarea-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { mockSubmit, type MockSubmitResult } from "@/lib/mock-submit"
import {
  contactFormDefaultValues,
  contactFormSchema,
  type ContactFormValues,
} from "@/schemas/contact-form.schema"

export function ContactForm() {
  const [result, setResult] = useState<MockSubmitResult | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactFormDefaultValues,
  })

  const onSubmit = async (values: ContactFormValues) => {
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
        <TextField label="Subject" registration={register("subject")} error={errors.subject?.message} />
      </div>
      <TextareaField
        label="Message"
        required
        rows={5}
        placeholder="Tell us how we can help…"
        registration={register("message")}
        error={errors.message?.message}
      />
      <CheckboxField
        name="consent"
        control={control}
        label="I agree to be contacted about my enquiry."
        error={errors.consent?.message}
      />

      {result ? (
        <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} />
      ) : null}

      <FormSubmitButton isSubmitting={isSubmitting}>Send message</FormSubmitButton>
    </form>
  )
}
