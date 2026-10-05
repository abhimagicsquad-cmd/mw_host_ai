import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CustomCodeSectionEditor } from "@/components/admin/custom-code/section-editor"
import { PageHeader } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { analyticsConfig } from "@/lib/analytics"
import { getAdminCustomCode, getSectionHistory } from "@/lib/custom-code/server"
import { SECTION_IDS, SECTION_META, sectionBySlug } from "@/lib/custom-code/types"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Custom Code Manager" }

export default async function CustomCodeSectionPage({ params }: { params: Promise<{ section: string }> }) {
  await requireAdmin("code.manage")
  const { section: slug } = await params
  const section = sectionBySlug(slug)
  if (!section) notFound()
  const [{ sections, drafts }, history] = await Promise.all([getAdminCustomCode(), getSectionHistory(section)])
  const meta = SECTION_META[section]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Custom Code Manager"
        description="Add code, styles, tracking and verification tags to every page of the website — no code changes or redeploy. Nothing here runs in the admin dashboard."
        breadcrumbs={[{ label: "Custom Code Manager", href: "/admin/code/head" }, { label: meta.label }]}
      />
      <nav aria-label="Custom code sections" className="flex gap-1 overflow-x-auto border-b">
        {SECTION_IDS.map((id) => (
          <Link
            key={id}
            href={`/admin/code/${SECTION_META[id].slug}`}
            aria-current={id === section ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              id === section ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn("size-1.5 rounded-full", sections[id].enabled ? "bg-emerald-500" : "bg-muted-foreground/40")} aria-hidden />
            {SECTION_META[id].label}
            <span className="sr-only">{sections[id].enabled ? "(enabled)" : "(disabled)"}</span>
          </Link>
        ))}
      </nav>
      <CustomCodeSectionEditor
        key={section}
        section={section}
        meta={meta}
        initial={sections[section]}
        hasDraft={Boolean(drafts[section])}
        history={history}
        googleAdsId={analyticsConfig.googleAdsId}
      />
    </div>
  )
}
