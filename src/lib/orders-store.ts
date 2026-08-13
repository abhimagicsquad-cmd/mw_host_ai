import { supabaseAdmin } from "@/lib/supabase/server-client"

export type OrderRecord = {
  orderRef: string
  planSlug: string
  planName: string
  billingCycle: string
  billingLabel: string
  amount: string
  name: string
  email: string
  phone: string
  company?: string
  source?: string
  pageUrl?: string
}

export type StoreOrderResult =
  | { stored: true; skipped: false }
  | { stored: false; skipped: true }
  | { stored: false; skipped: false; error: unknown }

/**
 * Inserts a mock order into Supabase. Mirrors `storeLead`'s skip/error shape — returns
 * `skipped: true` (not an error) when Supabase isn't configured yet, so the checkout flow
 * still completes (mock-paid, confirmation shown) even without a database wired up.
 */
export async function storeOrder(order: OrderRecord): Promise<StoreOrderResult> {
  if (!supabaseAdmin) {
    console.warn(
      "[orders-store] Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — skipping persistence.",
      { orderRef: order.orderRef }
    )
    return { stored: false, skipped: true }
  }

  const { error } = await supabaseAdmin.from("orders").insert({
    order_ref: order.orderRef,
    plan_slug: order.planSlug,
    plan_name: order.planName,
    billing_cycle: order.billingCycle,
    billing_label: order.billingLabel,
    amount: order.amount,
    name: order.name,
    email: order.email,
    phone: order.phone,
    company: order.company || null,
    source: order.source || null,
    page_url: order.pageUrl || null,
  })

  if (error) {
    console.error("[orders-store] Supabase insert failed", { error, orderRef: order.orderRef })
    return { stored: false, skipped: false, error }
  }

  return { stored: true, skipped: false }
}
