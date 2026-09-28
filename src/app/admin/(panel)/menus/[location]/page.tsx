import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MenuEditor } from "@/components/admin/menu-editor"
import { PageHeader, ProblemNotice } from "@/components/admin/ui"
import { footerColumns, mainNav } from "@/constants/nav-items"
import { requireAdmin } from "@/lib/admin/auth"
import { getMenu } from "@/lib/admin/queries"
import type { MenuLocation } from "@/lib/cms/types"
import { getSanityNavigation } from "@/sanity/lib/queries"

const CONFIG: Record<MenuLocation, { title: string; description: string }> = {
  header: { title: "Header menu", description: "Main navigation with dropdown (mega menu) columns. Icons appear next to dropdown links." },
  footer: { title: "Footer menu", description: "Link columns in the website footer." },
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const { location } = await params
  return { title: CONFIG[location as MenuLocation]?.title ?? "Menus" }
}

export default async function MenuPage({ params }: { params: Promise<{ location: string }> }) {
  await requireAdmin("menus.manage")
  const { location } = await params
  const config = CONFIG[location as MenuLocation]
  if (!config) notFound()

  const cms = await getMenu(location as MenuLocation)
  let items: unknown[] = cms.data ?? []
  let source: "cms" | "sanity" | "default" = "cms"
  if (!items.length) {
    const sanity = await getSanityNavigation()
    const fromSanity = location === "header" ? sanity?.mainMenu : sanity?.footerColumns
    if (fromSanity?.length) {
      items = fromSanity
      source = "sanity"
    } else {
      items = location === "header" ? mainNav : [footerColumns.quickLinks, footerColumns.services, footerColumns.resources]
      source = "default"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={config.title} description={config.description} breadcrumbs={[{ label: "Menus" }, { label: config.title }]} />
      <ProblemNotice problem={cms.problem} />
      {!cms.problem ? <MenuEditor location={location as MenuLocation} initialItems={JSON.parse(JSON.stringify(items))} source={source} /> : null}
    </div>
  )
}
