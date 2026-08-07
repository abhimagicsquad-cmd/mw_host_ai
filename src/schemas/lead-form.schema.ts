import { z } from "zod"

export const leadNameField = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(80, "Name is too long.")
  .regex(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, "Name can only contain letters and spaces.")

export const leadPhoneField = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Enter a valid 10-digit phone number.")

export const leadEmailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")

export const leadMessageField = z
  .string()
  .trim()
  .max(1000, "Message is too long (1000 characters max).")
  .optional()
  .or(z.literal(""))

/** Client-facing schema — exactly the fields rendered in <LeadForm />, plus a honeypot. */
export const leadFormSchema = z.object({
  name: leadNameField,
  phone: leadPhoneField,
  email: leadEmailField,
  message: leadMessageField,
  // Honeypot: real users never see or fill this. Non-empty => likely a bot.
  company: z.string().max(120).optional().or(z.literal("")),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>

export const leadFormDefaultValues: LeadFormValues = {
  name: "",
  phone: "",
  email: "",
  message: "",
  company: "",
}

/** Server-facing schema — adds anti-spam/attribution metadata sent alongside the form fields. */
export const leadApiPayloadSchema = leadFormSchema.extend({
  source: z.string().max(60).optional(),
  formRenderedAt: z.number().optional(),
})

export type LeadApiPayload = z.infer<typeof leadApiPayloadSchema>
