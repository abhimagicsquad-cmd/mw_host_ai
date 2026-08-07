import { z } from "zod"

import { serviceOptions } from "@/constants/service-options"
import { emailField, nameField, phoneField } from "@/schemas/shared"

export const leadMessageField = z
  .string()
  .trim()
  .max(1000, "Message is too long (1000 characters max).")
  .optional()
  .or(z.literal(""))

export const serviceField = z
  .string()
  .min(1, "Please select a service.")
  .refine(
    (value) => serviceOptions.some((option) => option.value === value),
    "Please select a valid service."
  )

/** Client-facing schema — exactly the fields rendered in <LeadForm />, plus a honeypot. */
export const leadFormSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  service: serviceField,
  message: leadMessageField,
  // Honeypot: real users never see or fill this. Non-empty => likely a bot.
  // Named distinctly from any real "company" field so the two never collide.
  website: z.string().max(120).optional().or(z.literal("")),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>

export const leadFormDefaultValues: LeadFormValues = {
  name: "",
  phone: "",
  email: "",
  service: "",
  message: "",
  website: "",
}

/**
 * Server-facing schema — the full superset accepted by /api/leads. Extends the
 * client schema with anti-spam/attribution metadata, plus the extra optional
 * fields <GetQuoteForm /> collects (real company name, hosting type) so both
 * forms can share one submission pipeline.
 */
export const leadApiPayloadSchema = leadFormSchema.extend({
  source: z.string().max(60).optional(),
  formRenderedAt: z.number().optional(),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  hostingType: z.string().max(60).optional().or(z.literal("")),
})

export type LeadApiPayload = z.infer<typeof leadApiPayloadSchema>
