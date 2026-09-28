import type { Metadata } from "next"

import { MigrationCenter } from "@/components/admin/migration-center"
import { PageHeader, ProblemNotice } from "@/components/admin/ui"
import { getContentAudit } from "@/lib/admin/audit"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { getMenu, getSettings, listPages } from "@/lib/admin/queries"
import { cmsAdminDb } from "@/lib/cms/db"
import { PRICING_COLLECTION_KEY } from "@/lib/cms/templates"

export const metadata: Metadata = { title: "Content migration" }

export default async function MigrationPage() {
  const admin = await requireAdmin("pages.edit")
  const [pages, header, footer, settings, pricing] = await Promise.all([
    listPages(),
    getMenu("header"),
    getMenu("footer"),
    getSettings(),
    cmsAdminDb?.from("settings").select("value").eq("key", PRICING_COLLECTION_KEY).maybeSingle(),
  ])
  const pricingValue = pricing?.data?.value as { published?: boolean } | undefined
  const settingsSaved = Object.values(settings.data.general).some(Boolean) || Object.values(settings.data.website).some(Boolean)
  const audit = await getContentAudit(
    pages.data,
    { exists: Boolean(pricingValue), published: Boolean(pricingValue?.published) },
    { header: Boolean(header.data?.length), footer: Boolean(footer.data?.length) },
    settingsSaved
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Content migration"
        description="Every page on the website, where its content comes from right now, and its status in the CMS. Sanity stays connected as the fallback throughout."
      />
      <ProblemNotice problem={pages.problem} />
      <MigrationCenter
        rows={audit.rows}
        shared={audit.shared}
        functional={audit.functional}
        warnings={audit.warnings}
        canImport={can(admin.role, "system.import")}
        canPublish={can(admin.role, "pages.publish")}
      />
    </div>
  )
}
