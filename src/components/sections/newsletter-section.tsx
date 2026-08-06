"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { TextField } from "@/components/forms/fields/text-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { SectionContainer } from "@/components/layout/section-container"
import { mockSubmit, type MockSubmitResult } from "@/lib/mock-submit"
import { emailField } from "@/schemas/shared"

const newsletterSchema = z.object({ email: emailField })
type NewsletterValues = z.infer<typeof newsletterSchema>

type NewsletterSectionProps = {
  title?: string
  description?: string
  background?: "navy" | "alt"
}

export function NewsletterSection({
  title = "Get hosting tips in your inbox",
  description = "Occasional emails about performance, security, and new features. No spam.",
  background = "navy",
}: NewsletterSectionProps) {
  const [result, setResult] = useState<MockSubmitResult | null>(null)
  const isDark = background === "navy"

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: NewsletterValues) => {
    const response = await mockSubmit(values)
    setResult(response)
    if (response.success) reset()
  }

  return (
    <SectionContainer background={background} width="default">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className={isDark ? "font-heading text-2xl font-bold text-white" : "font-heading text-2xl font-bold text-brand-navy"}>
            {title}
          </h2>
          <p className={isDark ? "mt-2 text-sm text-white/70" : "mt-2 text-sm text-body-text"}>{description}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-start"
          noValidate
        >
          <div className="flex-1">
            <TextField
              label=""
              type="email"
              placeholder="you@example.com"
              registration={register("email")}
              error={errors.email?.message}
            />
          </div>
          <FormSubmitButton isSubmitting={isSubmitting} className="w-full sm:w-auto">
            Subscribe
          </FormSubmitButton>
        </form>

        {result ? <FormStatusMessage status={result.success ? "success" : "error"} message={result.message} /> : null}
      </div>
    </SectionContainer>
  )
}
