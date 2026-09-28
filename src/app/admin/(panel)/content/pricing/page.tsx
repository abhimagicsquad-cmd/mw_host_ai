import type { Metadata } from "next"
import Link from "next/link"
import { Tags } from "lucide-react"

import { PricingEditor } from "@/components/admin/pricing-editor"
import { EmptyState, PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import { PRICING_COLLECTION_KEY, pricingPlanFields } from "@/lib/cms/templates"

export const metadata: Metadata = { title: "Pricing plans" }

export default async function PricingPlansPage() {
  const admin = await requireAdmin("pages.edit")
  const result = cmsAdminDb ? await cmsAdminDb.from("settings").select("value").eq("key", PRICING_COLLECTION_KEY).maybeSingle() : null
  const problem = !cmsAdminDb ? "unconfigured" : result?.error ? (isMissingTableError(result.error) ? "missing" : result.error.message) : null
  const collection = (result?.data?.value ?? null) as { published?: boolean; plans?: Record<string, unknown>[] } | null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pricing plans"
        breadcrumbs={[{ label: "Content" }, { label: "Pricing plans" }]}
        description="Every hosting, VPS, dedicated, SSL and email plan in one place. Pages that list plans (home, hubs, service pages, checkout) read from here."
      />
      <ProblemNotice problem={problem} />
      {!problem && !collection ? (
        <Panel>
          <EmptyState
            icon={Tags}
            title="Pricing plans aren't in the CMS yet"
            description="Import all existing content from the Migration page — the plans currently shown on the site are copied here as a draft."
            action={
              <Link href="/admin/migration" className={buttonVariants()}>
                Open migration
              </Link>
            }
          />
        </Panel>
      ) : null}
      {collection ? (
        <PricingEditor
          initialPlans={collection.plans ?? []}
          initialPublished={Boolean(collection.published)}
          fields={pricingPlanFields}
          canPublish={can(admin.role, "pages.publish")}
        />
      ) : null}
    </div>
  )
}
