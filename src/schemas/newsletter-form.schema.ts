import { z } from "zod"

import { emailField } from "@/schemas/shared"

export const newsletterFormSchema = z.object({
  email: emailField,
  // Honeypot: real users never see or fill this. Non-empty => likely a bot.
  website: z.string().max(120).optional().or(z.literal("")),
})

export type NewsletterFormValues = z.infer<typeof newsletterFormSchema>

export const newsletterFormDefaultValues: NewsletterFormValues = {
  email: "",
  website: "",
}

export const newsletterApiPayloadSchema = newsletterFormSchema.extend({
  source: z.string().max(60).optional(),
  formRenderedAt: z.number().optional(),
  pageUrl: z.string().max(500).optional().or(z.literal("")),
})

export type NewsletterApiPayload = z.infer<typeof newsletterApiPayloadSchema>
