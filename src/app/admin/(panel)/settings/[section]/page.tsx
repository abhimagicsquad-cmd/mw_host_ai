import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { GeneralSettingsForm, WebsiteSettingsForm } from "@/components/admin/settings-forms"
import { PageHeader, ProblemNotice } from "@/components/admin/ui"
import { siteConfig } from "@/constants/site-config"
import { requireAdmin } from "@/lib/admin/auth"
import { getSettings } from "@/lib/admin/queries"
import type { GeneralSettings } from "@/lib/cms/types"

const SECTIONS = {
  general: { title: "General settings", description: "Site name, contact details and business hours shown in the header, footer and contact page." },
  website: { title: "Website settings", description: "Header button, social links and default SEO." },
} as const

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params
  return { title: SECTIONS[section as keyof typeof SECTIONS]?.title ?? "Settings" }
}

export default async function SettingsPage({ params }: { params: Promise<{ section: string }> }) {
  await requireAdmin("settings.manage")
  const { section } = await params
  const config = SECTIONS[section as keyof typeof SECTIONS]
  if (!config) notFound()

  const { data, problem } = await getSettings()

  // What the website shows when a dashboard field is empty (the built-in defaults).
  const live: GeneralSettings = {
    siteName: siteConfig.name,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    contactPhone: siteConfig.contact.phone,
    contactPhoneHref: siteConfig.contact.phoneHref,
    contactEmail: siteConfig.contact.email,
    contactAddress: siteConfig.contact.address,
    salesHours: siteConfig.contact.hours.sales,
    accountingHours: siteConfig.contact.hours.accounting,
    supportHours: siteConfig.contact.hours.support,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={config.title} description={config.description} breadcrumbs={[{ label: "Settings" }, { label: config.title }]} />
      <nav aria-label="Settings sections" className="flex gap-1 border-b">
        {(Object.keys(SECTIONS) as (keyof typeof SECTIONS)[]).map((key) => (
          <Link
            key={key}
            href={`/admin/settings/${key}`}
            aria-current={key === section ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${key === section ? "border-admin-secondary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {SECTIONS[key].title}
          </Link>
        ))}
      </nav>
      <ProblemNotice problem={problem} />
      {problem ? null : section === "general" ? (
        <GeneralSettingsForm values={data.general} live={live} />
      ) : (
        <WebsiteSettingsForm values={data.website} />
      )}
    </div>
  )
}
