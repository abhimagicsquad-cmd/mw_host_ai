import { z } from "zod"

import { emailField, nameField, phoneField } from "@/schemas/shared"

export const serviceOptions = [
  { value: "shared-hosting", label: "Shared Hosting" },
  { value: "vps-hosting", label: "VPS Hosting" },
  { value: "dedicated-server", label: "Dedicated Server" },
  { value: "domain", label: "Domain Registration" },
  { value: "ssl", label: "SSL Certificate" },
  { value: "email-hosting", label: "Email Hosting" },
] as const

export const getQuoteFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: z.string().trim().max(120, "Company name is too long.").optional().or(z.literal("")),
  service: z
    .string()
    .min(1, "Please select a service.")
    .refine(
      (value) => serviceOptions.some((option) => option.value === value),
      "Please select a valid service."
    ),
  requirements: z
    .string()
    .trim()
    .min(10, "Please describe your requirements (at least 10 characters).")
    .max(2000, "Message is too long."),
})

export type GetQuoteFormValues = z.infer<typeof getQuoteFormSchema>

export const getQuoteFormDefaultValues: GetQuoteFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  requirements: "",
}
