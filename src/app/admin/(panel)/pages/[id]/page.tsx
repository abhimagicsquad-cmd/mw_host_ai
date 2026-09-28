import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Info } from "lucide-react"

import { PageStatusControls } from "@/components/admin/page-status-controls"
import { PageDetailsForm } from "@/components/admin/page-details-form"
import { PageEditorTabs } from "@/components/admin/page-editor-tabs"
import { SectionBuilder } from "@/components/admin/section-builder"
import { TemplateEditor } from "@/components/admin/template-editor"
import { SeoForm } from "@/components/admin/seo-form"
import { formatDate, PAGE_TYPE_LABELS, PageHeader, Panel, Pill, ProblemNotice, StatusBadge } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { getPageWithSections, getSeo } from "@/lib/admin/queries"
import { CMS_INTEGRATED_PATHS } from "@/lib/cms/paths"
import { templateForPath, templates, templateSectionType } from "@/lib/cms/templates"

export const metadata: Metadata = { title: "Edit page" }

export default async function EditPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; duplicated?: string }>
}) {
  const admin = await requireAdmin()
  const { id } = await params
  const { created, duplicated } = await searchParams
  const { data: page, problem } = await getPageWithSections(id)

  if (problem) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Edit page" breadcrumbs={[{ label: "Pages", href: "/admin/pages" }]} />
        <ProblemNotice problem={problem} />
      </div>
    )
  }
  if (!page) notFound()

  const seo = await getSeo(page.path)
  const canEdit = can(admin.role, "pages.edit")
  const builtIn = CMS_INTEGRATED_PATHS[page.path]
  const template = templateForPath(page.path)
  const templateData = template ? page.sections.find((s) => s.type === templateSectionType(template))?.data : undefined

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={page.title}
        breadcrumbs={[{ label: "Pages", href: "/admin/pages" }, { label: page.title }]}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={page.status} />
            <Pill>{PAGE_TYPE_LABELS[page.page_type]}</Pill>
            <code className="text-xs">{page.path}</code>
            <span className="text-xs">· Updated {formatDate(page.updated_at)}</span>
          </span>
        }
        actions={
          <PageStatusControls
            page={{ id: page.id, title: page.title, path: page.path, status: page.status }}
            canPublish={can(admin.role, "pages.publish")}
            canDelete={can(admin.role, "pages.delete")}
            canEdit={canEdit}
          />
        }
      />

      {created || duplicated ? (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          {created ? "Page created as a draft." : "Page duplicated as a draft."} Add content below, then publish when it&apos;s ready.
        </p>
      ) : null}

      {builtIn ? (
        <p className="flex items-start gap-2 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            This page replaces the built-in <strong className="text-foreground">{builtIn}</strong> content once published with at least one visible section.
            Unpublish it to fall back to the original design.
          </span>
        </p>
      ) : null}

      <PageEditorTabs
        tabs={[
          {
            id: "content",
            label: template ? "Content" : `Content (${page.sections.length})`,
            content: template ? (
              <TemplateEditor pageId={page.id} template={template} initialData={templateData ?? templates[template].defaults} canEdit={canEdit} />
            ) : (
              <SectionBuilder
                pageId={page.id}
                canEdit={canEdit}
                initialSections={page.sections.map(({ id, type, data, is_visible }) => ({ id, type, data, is_visible }))}
              />
            ),
          },
          {
            id: "details",
            label: "Page details",
            content: (
              <Panel>
                <PageDetailsForm page={page} canEdit={canEdit} />
              </Panel>
            ),
          },
          {
            id: "seo",
            label: "SEO",
            content: can(admin.role, "seo.manage") ? (
              <Panel>
                <SeoForm path={page.path} seo={seo.data} fallbackTitle={page.title} fallbackDescription={page.excerpt ?? undefined} />
              </Panel>
            ) : (
              <Panel>
                <p className="text-sm text-muted-foreground">Your role can&apos;t edit SEO.</p>
              </Panel>
            ),
          },
        ]}
      />
    </div>
  )
}
