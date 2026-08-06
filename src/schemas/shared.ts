import { z } from "zod"

export const nameField = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(80, "Name is too long.")

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.")

export const phoneField = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number.")
  .max(20, "Please enter a valid phone number.")
  .regex(/^[+\d][\d\s()-]*$/, "Please enter a valid phone number.")

export const messageField = z
  .string()
  .trim()
  .min(10, "Please add a few more details (at least 10 characters).")
  .max(2000, "Message is too long.")

export const consentField = z
  .boolean()
  .refine((value) => value === true, "Please accept the terms to continue.")
