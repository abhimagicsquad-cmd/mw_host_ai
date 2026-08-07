import { z } from "zod"

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

export const messageField = z
  .string()
  .trim()
  .min(10, "Please add a few more details (at least 10 characters).")
  .max(2000, "Message is too long.")

export const consentField = z
  .boolean()
  .refine((value) => value === true, "Please accept the terms to continue.")
