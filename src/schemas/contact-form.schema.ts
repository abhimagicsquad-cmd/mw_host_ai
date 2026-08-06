import { z } from "zod"

import { consentField, emailField, messageField, nameField, phoneField } from "@/schemas/shared"

export const contactFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  subject: z.string().trim().max(120, "Subject is too long.").optional().or(z.literal("")),
  message: messageField,
  consent: consentField,
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const contactFormDefaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
}
