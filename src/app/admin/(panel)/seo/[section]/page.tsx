import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, Circle, Pencil, Plus } from "lucide-react"

import { SeoForm, type SeoFormSection } from "@/components/admin/seo-form"
import { SeoResetButton } from "@/components/admin/seo-reset-button"
import { PageHeader, Panel, Pill, ProblemNotice, Table, Td, Th } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import sitemap from "@/app/sitemap"
import { siteConfig } from "@/constants/site-config"
import { requireAdmin } from "@/lib/admin/auth"
import { listPages, listSeo } from "@/lib/admin/queries"
import { normalizePath } from "@/lib/cms/paths"
import type { SeoRow } from "@/lib/cms/types"

type Section = Exclude<SeoFormSection, "all">

const SECTIONS: Record<Section, { title: string; description: string; column: string; value: (seo: SeoRow | undefined) => string | null }> = {
  titles: {
    title: "Meta titles",
    description: "The clickable headline in Google results and the browser tab. Also manage canonical URLs and noindex here.",
    column: "Meta title",
    value: (seo) => seo?.meta_title ?? null,
  },
  descriptions: {
    title: "Meta descriptions",
    description: "The snippet shown under the title in search results.",
    column: "Meta description",
    value: (seo) => seo?.meta_description ?? null,
  },
  schema: {
    title: "Schema (structured data)",
    description: "Custom schema.org JSON-LD per page, for rich results (FAQ, Product, Service, Organization…).",
    column: "Schema",
    value: (seo) => (seo?.schema_json ? `${JSON.stringify(seo.schema_json).slice(0, 80)}…` : null),
  },
  "open-graph": {
    title: "Open Graph & social cards",
    description: "How pages look when shared on Facebook, LinkedIn, WhatsApp and X/Twitter.",
    column: "OG title / image",
    value: (seo) => [seo?.og_title, seo?.og_image ? "image set" : null].filter(Boolean).join(" · ") || null,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params
  return { title: `SEO · ${SECTIONS[section as Section]?.title ?? ""}` }
}

export default async function SeoSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>
  searchParams: Promise<{ path?: string; new?: string }>
}) {
  await requireAdmin("seo.manage")
  const { section } = await params
  const config = SECTIONS[section as Section]
  if (!config) notFound()
  const { path: rawPath, new: isNew } = await searchParams

  const [seoRows, pages, siteEntries] = await Promise.all([listSeo(), listPages(), sitemap()])
  const seoByPath = new Map(seoRows.data.map((row) => [row.path, row]))
  const pageByPath = new Map(pages.data.map((page) => [page.path, page]))

  const tabs = (Object.keys(SECTIONS) as Section[]).map((key) => (
    <Link
      key={key}
      href={`/admin/seo/${key}${rawPath ? `?path=${encodeURIComponent(rawPath)}` : ""}`}
      aria-current={key === section ? "page" : undefined}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${key === section ? "border-admin-secondary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {SECTIONS[key].title.split(" (")[0]}
    </Link>
  ))

  // Editor view for one path.
  if (rawPath || isNew) {
    const path = rawPath ? normalizePath(rawPath) : ""
    const page = pageByPath.get(path)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={path ? `SEO for ${path}` : "Add SEO for a URL"}
          breadcrumbs={[{ label: "SEO", href: `/admin/seo/${section}` }, { label: path || "New" }]}
          description={page ? `CMS page: ${page.title}` : path ? "Built-in page — these settings override its default metadata." : undefined}
          actions={path && seoByPath.has(path) ? <SeoResetButton path={path} /> : null}
        />
        <nav aria-label="SEO sections" className="flex gap-1 overflow-x-auto border-b">
          {tabs}
        </nav>
        <ProblemNotice problem={seoRows.problem} />
        <Panel>
          <SeoForm
            key={`${path}-${section}`}
            path={path || "/"}
            lockPath={Boolean(path)}
            seo={seoByPath.get(path) ?? null}
            fallbackTitle={page?.title}
            fallbackDescription={page?.excerpt ?? undefined}
            section={section as Section}
          />
        </Panel>
      </div>
    )
  }

  const paths = new Set<string>([
    ...siteEntries.map((entry) => entry.url.replace(siteConfig.url, "") || "/"),
    ...pages.data.map((page) => page.path),
    ...seoRows.data.map((row) => row.path),
  ])
  const rows = [...paths].sort((a, b) => a.localeCompare(b)).map((path) => ({ path, page: pageByPath.get(path), seo: seoByPath.get(path) }))
  const configured = rows.filter((row) => config.value(row.seo)).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[{ label: "SEO" }, { label: config.title }]}
        actions={
          <Link href={`/admin/seo/${section}?new=1`} className={buttonVariants({ variant: "outline" })}>
            <Plus />
            Custom URL
          </Link>
        }
      />
      <nav aria-label="SEO sections" className="flex gap-1 overflow-x-auto border-b">
        {tabs}
      </nav>
      <ProblemNotice problem={seoRows.problem} />
      <Panel title={`${configured} of ${rows.length} URLs customised`} bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>URL</Th>
              <Th>{config.column}</Th>
              <Th className="text-right">Edit</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const value = config.value(row.seo)
              return (
                <tr key={row.path} className="hover:bg-muted/30">
                  <Td>
                    <p className="font-mono text-[13px]">{row.path}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {row.page ? <Pill>CMS · {row.page.title}</Pill> : <Pill>Built-in</Pill>}
                      {row.seo?.no_index ? <Pill className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">noindex</Pill> : null}
                    </p>
                  </Td>
                  <Td className="max-w-md">
                    <span className="flex items-start gap-2">
                      {value ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Customised" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" aria-label="Using page default" />
                      )}
                      <span className={value ? "line-clamp-2" : "text-muted-foreground"}>{value ?? "Page default"}</span>
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/seo/${section}?path=${encodeURIComponent(row.path)}`}
                      className="inline-flex rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Edit SEO for ${row.path}`}
                    >
                      <Pencil className="size-4" />
                    </Link>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Panel>
    </div>
  )
}
