import { z } from "zod"

// Skip zod's JIT (it probes `new Function("")`), which the site's CSP blocks without
// 'unsafe-eval' and reports as a violation. Every form schema imports this module.
z.config({ jitless: true })

export const nameField = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(80, "Name is too long.")
  .regex(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, "Name can only contain letters and spaces.")

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.")

export const phoneField = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Enter a valid 10-digit phone number.")