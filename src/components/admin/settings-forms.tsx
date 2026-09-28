"use client"

import { useRouter } from "next/navigation"
import { useActionState, useState, useTransition } from "react"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveGeneralSettingsAction, saveWebsiteSettingsAction } from "@/lib/admin/actions/settings"
import type { ActionState, GeneralSettings, WebsiteSettings } from "@/lib/cms/types"

import { Field, FormMessage, SubmitButton } from "./form-controls"
import { Panel } from "./ui"

type GeneralField = { name: keyof GeneralSettings; label: string; multiline?: boolean; help?: string }

const GENERAL_GROUPS: { title: string; fields: GeneralField[] }[] = [
  {
    title: "Brand",
    fields: [
      { name: "siteName", label: "Site name" },
      { name: "tagline", label: "Tagline" },
      { name: "description", label: "Footer description", multiline: true },
    ],
  },
  {
    title: "Contact details",
    fields: [
      { name: "contactPhone", label: "Phone (display)" },
      { name: "contactPhoneHref", label: "Phone link", help: "e.g. tel:+918421903846" },
      { name: "contactEmail", label: "Email" },
      { name: "contactAddress", label: "Address", multiline: true },
    ],
  },
  {
    title: "Business hours",
    fields: [
      { name: "salesHours", label: "Sales" },
      { name: "accountingHours", label: "Accounting" },
      { name: "supportHours", label: "Support" },
    ],
  },
]

export function GeneralSettingsForm({ values, live }: { values: GeneralSettings; live: GeneralSettings }) {
  const [state, formAction] = useActionState(saveGeneralSettingsAction, {})
  return (
    <form action={formAction} className="flex flex-col gap-6">
      {GENERAL_GROUPS.map((group) => (
        <Panel key={group.title} title={group.title}>
          <div className="grid gap-5 sm:grid-cols-2">
            {group.fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                className={field.multiline ? "sm:col-span-2" : undefined}
                help={field.help ?? (live[field.name] && !values[field.name] ? `Currently: ${live[field.name]}` : undefined)}
              >
                {(id) =>
                  field.multiline ? (
                    <Textarea id={id} name={field.name} rows={2} defaultValue={values[field.name] ?? ""} placeholder={live[field.name]} />
                  ) : (
                    <Input id={id} name={field.name} defaultValue={values[field.name] ?? ""} placeholder={live[field.name]} />
                  )
                }
              </Field>
            ))}
          </div>
        </Panel>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>
          <Save />
          Save settings
        </SubmitButton>
        <FormMessage state={state} className="flex-1" />
      </div>
      <p className="text-xs text-muted-foreground">Empty fields keep the website&apos;s current value (shown as placeholder).</p>
    </form>
  )
}

export function WebsiteSettingsForm({ values }: { values: WebsiteSettings }) {
  const router = useRouter()
  const [headerCta, setHeaderCta] = useState(values.headerCta ?? { label: "", href: "" })
  const [globalCta, setGlobalCta] = useState(values.globalCta ?? { label: "", href: "" })
  const [socialLinks, setSocialLinks] = useState(values.socialLinks ?? [])
  const [meta, setMeta] = useState({
    defaultMetaTitle: values.defaultMetaTitle ?? "",
    defaultMetaDescription: values.defaultMetaDescription ?? "",
  })
  const [state, setState] = useState<ActionState>()
  const [saving, startSaving] = useTransition()

  function save() {
    startSaving(async () => {
      const result = await saveWebsiteSettingsAction(JSON.stringify({ headerCta, globalCta, socialLinks, ...meta }))
      setState(result)
      if (!result.error) router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Calls to action" description="Button labels used across the site">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Header button label" help="The main button in the site header (opens the lead form).">
            {(id) => <Input id={id} value={headerCta.label} onChange={(e) => setHeaderCta({ ...headerCta, label: e.target.value })} placeholder="Get Started" />}
          </Field>
          <Field label="Header button link">
            {(id) => <Input id={id} value={headerCta.href} onChange={(e) => setHeaderCta({ ...headerCta, href: e.target.value })} placeholder="#lead" />}
          </Field>
          <Field label="Global CTA label">
            {(id) => <Input id={id} value={globalCta.label} onChange={(e) => setGlobalCta({ ...globalCta, label: e.target.value })} />}
          </Field>
          <Field label="Global CTA link">
            {(id) => <Input id={id} value={globalCta.href} onChange={(e) => setGlobalCta({ ...globalCta, href: e.target.value })} />}
          </Field>
        </div>
      </Panel>

      <Panel title="Social links" description="Shown as icons in the footer. Known platforms: Facebook, Twitter/X, LinkedIn, Instagram, YouTube.">
        <div className="flex flex-col gap-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <Input
                aria-label="Platform"
                value={link.platform}
                onChange={(e) => setSocialLinks(socialLinks.map((l, i) => (i === index ? { ...l, platform: e.target.value } : l)))}
                placeholder="Facebook"
                className="w-40"
              />
              <Input
                aria-label="Profile URL"
                value={link.url}
                onChange={(e) => setSocialLinks(socialLinks.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)))}
                placeholder="https://facebook.com/…"
                className="min-w-52 flex-1"
              />
              <Button variant="ghost" size="icon" aria-label="Remove link" onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}>
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="self-start" onClick={() => setSocialLinks([...socialLinks, { platform: "", url: "" }])}>
            <Plus />
            Add social link
          </Button>
        </div>
      </Panel>

      <Panel title="Default SEO" description="Used for pages without their own SEO settings.">
        <div className="flex flex-col gap-5">
          <Field label="Default meta title" help="The browser-tab title for the home page and pages without one.">
            {(id) => <Input id={id} value={meta.defaultMetaTitle} onChange={(e) => setMeta({ ...meta, defaultMetaTitle: e.target.value })} maxLength={120} />}
          </Field>
          <Field label="Default meta description">
            {(id) => <Textarea id={id} rows={2} value={meta.defaultMetaDescription} onChange={(e) => setMeta({ ...meta, defaultMetaDescription: e.target.value })} maxLength={320} />}
          </Field>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save settings
        </Button>
        <FormMessage state={state} className="flex-1" />
      </div>
    </div>
  )
}
