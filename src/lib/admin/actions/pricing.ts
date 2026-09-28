"use server"

import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { PRICING_COLLECTION_KEY } from "@/lib/cms/templates"
import type { ActionState } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

const planSchema = z.object({
  name: z.string().trim().min(1, "Every plan needs a name"),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Plan slugs may only contain lowercase letters, numbers and dashes"),
  service: z.string().trim().min(1, "Every plan needs a service"),
  price: z.string().trim().min(1, "Every plan needs a price"),
})

/** Saves the shared Pricing Plans collection. `published` controls whether the website uses it. */
export async function savePricingPlansAction(payload: string, published: boolean): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.edit")
    if (published) await authorizeAction("pages.publish")
    if (!cmsAdminDb) throw new Error("The CMS database is not configured.")

    const plans = JSON.parse(payload) as Record<string, unknown>[]
    if (!Array.isArray(plans)) return { error: "Invalid plans." }
    for (const plan of plans) {
      const check = planSchema.safeParse(plan)
      if (!check.success) return { error: `${String(plan.name || "A plan")}: ${check.error.issues[0]?.message}` }
    }
    const slugs = plans.map((plan) => plan.slug)
    const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index)
    if (duplicate) return { error: `Two plans use the slug “${String(duplicate)}”. Slugs must be unique.` }

    const { error } = await cmsAdminDb
      .from("settings")
      .upsert({ key: PRICING_COLLECTION_KEY, value: { published, plans }, updated_by: actorId(admin), updated_at: new Date().toISOString() }, { onConflict: "key" })
    if (error) throw error

    await logActivity({
      admin,
      action: "content.updated",
      entityType: "pricing",
      description: `${published ? "Saved and published" : "Saved (draft)"} pricing plans (${plans.length} plans)`,
    })
    refreshWebsite()
    return { ok: true, message: published ? "Pricing plans saved — live on the website now." : "Pricing plans saved as a draft." }
  } catch (error) {
    return toActionError(error)
  }
}
