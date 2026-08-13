import { z } from "zod"

import { emailField, nameField, phoneField } from "@/schemas/shared"

/** Client-facing schema for the mock checkout flow's "account" step. */
export const orderAccountSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: z.string().trim().max(120, "Company name is too long.").optional().or(z.literal("")),
})

export type OrderAccountValues = z.infer<typeof orderAccountSchema>

export const orderAccountDefaultValues: OrderAccountValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
}

export const billingCycleValueSchema = z.enum(["monthly", "annually", "biennially", "triennially"])

/** What the <OrderFlow> form itself collects and validates across its steps. */
export const orderClientSchema = orderAccountSchema.extend({
  billingCycle: billingCycleValueSchema,
  // Honeypot: real users never see or fill this. Non-empty => likely a bot.
  website: z.string().max(120).optional().or(z.literal("")),
})

export type OrderClientValues = z.infer<typeof orderClientSchema>

/**
 * Server-facing schema — the client schema plus the plan/pricing snapshot (derived from
 * the selected billing cycle, not user-typed) and anti-spam/attribution metadata.
 */
export const orderApiPayloadSchema = orderClientSchema.extend({
  planSlug: z.string().min(1),
  planName: z.string().min(1),
  billingLabel: z.string().min(1),
  amount: z.string().min(1),
  source: z.string().max(60).optional(),
  formRenderedAt: z.number().optional(),
  pageUrl: z.string().max(500).optional().or(z.literal("")),
})

export type OrderApiPayload = z.infer<typeof orderApiPayloadSchema>
