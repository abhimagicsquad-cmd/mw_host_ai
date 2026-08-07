import { z } from "zod"

import { emailField, nameField, phoneField } from "@/schemas/shared"
import { serviceField } from "@/schemas/lead-form.schema"
import { hostingTypeOptions, serviceOptions } from "@/constants/service-options"

export { serviceOptions, hostingTypeOptions }

export const getQuoteFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: z.string().trim().max(120, "Company name is too long.").optional().or(z.literal("")),
  service: serviceField,
  hostingType: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || hostingTypeOptions.some((option) => option.value === value),
      "Please select a valid hosting type."
    ),
  requirements: z
    .string()
    .trim()
    .min(10, "Please describe your requirements (at least 10 characters).")
    .max(2000, "Message is too long."),
  // Honeypot: real users never see or fill this. Non-empty => likely a bot.
  website: z.string().max(120).optional().or(z.literal("")),
})

export type GetQuoteFormValues = z.infer<typeof getQuoteFormSchema>

export const getQuoteFormDefaultValues: GetQuoteFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  hostingType: "",
  requirements: "",
  website: "",
}
