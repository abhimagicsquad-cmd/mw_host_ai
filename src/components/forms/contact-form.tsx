"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
    if (response.success) {
      reset()
      router.push("/thank-you")
      return
    }
    setResult(response)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" required placeholder="Full Name *" registration={register("name")} error={errors.name?.message} />
        <TextField
          label="Email address"
          type="email"
          required
          placeholder="Email Address *"
          registration={register("email")}
          error={errors.email?.message}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Phone number"
          type="tel"
          required
          placeholder="Phone Number *"
          registration={register("phone")}
          error={errors.phone?.message}
        />
        <TextField label="Subject" placeholder="Subject" registration={register("subject")} error={errors.subject?.message} />
      </div>
      <TextareaField
        label="Message"
        required
        rows={5}
        placeholder="Message *"
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
