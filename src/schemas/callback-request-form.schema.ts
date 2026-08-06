import { z } from "zod"

import { nameField, phoneField } from "@/schemas/shared"

export const preferredTimeOptions = [
  { value: "morning", label: "Morning (9 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM – 4 PM)" },
  { value: "evening", label: "Evening (4 PM – 7 PM)" },
] as const

export const callbackRequestFormSchema = z.object({
  name: nameField,
  phone: phoneField,
  preferredTime: z
    .string()
    .min(1, "Please select a preferred time.")
    .refine(
      (value) => preferredTimeOptions.some((option) => option.value === value),
      "Please select a valid time slot."
    ),
  reason: z.string().trim().max(500, "Message is too long.").optional().or(z.literal("")),
})

export type CallbackRequestFormValues = z.infer<typeof callbackRequestFormSchema>

export const callbackRequestFormDefaultValues: CallbackRequestFormValues = {
  name: "",
  phone: "",
  preferredTime: "",
  reason: "",
}
