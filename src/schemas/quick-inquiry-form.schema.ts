import { z } from "zod"

import { emailField, nameField, phoneField } from "@/schemas/shared"

export const quickInquiryFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  message: z
    .string()
    .trim()
    .min(5, "Tell us a little about what you need.")
    .max(500, "Message is too long."),
})

export type QuickInquiryFormValues = z.infer<typeof quickInquiryFormSchema>

export const quickInquiryFormDefaultValues: QuickInquiryFormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
}
