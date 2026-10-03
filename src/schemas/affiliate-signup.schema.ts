import { z } from "zod"

import { emailField, phoneField } from "@/schemas/shared"

const namePart = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Please enter your ${label}.`)
    .max(40, `${label[0].toUpperCase()}${label.slice(1)} is too long.`)
    .regex(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, `${label[0].toUpperCase()}${label.slice(1)} can only contain letters and spaces.`)

/** The WordPress affiliate signup form's fields: first name, last name, email and mobile number. */
export const affiliateSignupSchema = z.object({
  firstName: namePart("first name"),
  lastName: namePart("last name"),
  email: emailField,
  phone: phoneField,
  // Honeypot (see <LeadForm />).
  website: z.string().max(120).optional().or(z.literal("")),
})

export type AffiliateSignupValues = z.infer<typeof affiliateSignupSchema>

export const affiliateSignupDefaultValues: AffiliateSignupValues = { firstName: "", lastName: "", email: "", phone: "", website: "" }
