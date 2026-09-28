"use client"

import { useActionState, useState } from "react"
import { Save } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveSeoAction } from "@/lib/admin/actions/seo"
import type { SeoRow } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { checkboxClassName, Field, FormMessage, selectClassName, SubmitButton } from "./form-controls"
import { MediaUrlInput } from "./media-picker"

const SITE_URL = "https://www.magicworkshost.com"

function Counter({ value, ideal }: { value: string; ideal: [number, number] }) {
  const length = value.length
  const tone = length === 0 ? "text-muted-foreground" : length < ideal[0] || length > ideal[1] ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
  return (
    <span className={cn("tabular-nums", tone)}>
      {length} chars · ideal {ideal[0]}–{ideal[1]}
    </span>
  )
}

export type SeoFormSection = "all" | "titles" | "descriptions" | "schema" | "open-graph"

export function SeoForm({
  path,
  seo,
  fallbackTitle,
  fallbackDescription,
  lockPath = true,
  section = "all",
}: {
  path: string
  seo: SeoRow | null
  fallbackTitle?: string
  fallbackDescription?: string
  lockPath?: boolean
  section?: SeoFormSection
}) {
  const [state, formAction] = useActionState(saveSeoAction, {})
  const [values, setValues] = useState({
    path,
    meta_title: seo?.meta_title ?? "",
    meta_description: seo?.meta_description ?? "",
    canonical_url: seo?.canonical_url ?? "",
    og_title: seo?.og_title ?? "",
    og_description: seo?.og_description ?? "",
    og_image: seo?.og_image ?? "",
    twitter_card: seo?.twitter_card ?? "",
    twitter_title: seo?.twitter_title ?? "",
    twitter_description: seo?.twitter_description ?? "",
    twitter_image: seo?.twitter_image ?? "",
    schema_json: seo?.schema_json ? JSON.stringify(seo.schema_json, null, 2) : "",
  })
  const [noIndex, setNoIndex] = useState(seo?.no_index ?? false)
  const set = (key: keyof typeof values) => (event: { target: { value: string } }) => setValues((prev) => ({ ...prev, [key]: event.target.value }))

  const show = (part: Exclude<SeoFormSection, "all">) => section === "all" || section === part
  const previewTitle = values.meta_title || fallbackTitle || "Page title"
  const previewDescription = values.meta_description || fallbackDescription || "Add a meta description to control this snippet."
  const displayUrl = `${SITE_URL.replace("https://", "")}${values.path === "/" ? "" : values.path.replace(/\//g, " › ").replace(/^ › /, " › ")}`

  let schemaError: string | undefined
  if (values.schema_json.trim()) {
    try {
      JSON.parse(values.schema_json)
    } catch {
      schemaError = "Not valid JSON yet"
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Every field is always submitted so saving one tab never wipes another. */}
      {Object.entries(values).map(([key, value]) =>
        key === "path" && !lockPath ? null : <input key={key} type="hidden" name={key} value={value} />
      )}
      {noIndex ? <input type="hidden" name="no_index" value="on" /> : null}

      {!lockPath ? (
        <Field label="Page path" required help="Any website URL path, e.g. /hosting/wordpress-hosting" error={state.fieldErrors?.path}>
          {(id) => <Input id={id} name="path" value={values.path} onChange={set("path")} className="font-mono text-[13px]" required />}
        </Field>
      ) : null}

      {show("titles") || show("descriptions") ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-5">
            {show("titles") ? (
              <Field
                label="Meta title"
                help={<Counter value={values.meta_title} ideal={[30, 60]} />}
                error={state.fieldErrors?.meta_title}
              >
                {(id) => <Input id={id} value={values.meta_title} onChange={set("meta_title")} placeholder={fallbackTitle} maxLength={120} />}
              </Field>
            ) : null}
            {show("descriptions") ? (
              <Field label="Meta description" help={<Counter value={values.meta_description} ideal={[70, 160]} />}>
                {(id) => <Textarea id={id} rows={3} value={values.meta_description} onChange={set("meta_description")} placeholder={fallbackDescription} maxLength={320} />}
              </Field>
            ) : null}
            {section === "all" || section === "titles" ? (
              <>
                <Field label="Canonical URL" help="Leave empty to use this page's own URL." error={state.fieldErrors?.canonical_url}>
                  {(id) => <Input id={id} value={values.canonical_url} onChange={set("canonical_url")} placeholder={`${SITE_URL}${values.path}`} />}
                </Field>
                <label className="flex items-center gap-2.5 text-sm">
                  <input type="checkbox" className={checkboxClassName} checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} />
                  Hide from search engines (noindex, nofollow)
                </label>
              </>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Google preview</p>
            <div className="rounded-xl border bg-white p-4 text-left shadow-xs">
              <p className="truncate text-xs text-[#4d5156]">{displayUrl}</p>
              <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{previewTitle}</p>
              <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{previewDescription}</p>
            </div>
          </div>
        </div>
      ) : null}

      {show("open-graph") ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-5">
            <p className="text-sm font-semibold">Open Graph (Facebook, LinkedIn, WhatsApp)</p>
            <Field label="OG title" help="Defaults to the meta title.">
              {(id) => <Input id={id} value={values.og_title} onChange={set("og_title")} maxLength={120} />}
            </Field>
            <Field label="OG description" help="Defaults to the meta description.">
              {(id) => <Textarea id={id} rows={2} value={values.og_description} onChange={set("og_description")} maxLength={320} />}
            </Field>
            <Field label="OG image" help="1200 × 630 px recommended." error={state.fieldErrors?.og_image}>
              {(id) => <MediaUrlInput id={id} value={values.og_image} onChange={(url) => setValues((prev) => ({ ...prev, og_image: url }))} />}
            </Field>
            <p className="pt-2 text-sm font-semibold">Twitter / X card</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Card type">
                {(id) => (
                  <select id={id} value={values.twitter_card} onChange={set("twitter_card")} className={selectClassName}>
                    <option value="">Default (large image)</option>
                    <option value="summary_large_image">Large image</option>
                    <option value="summary">Summary</option>
                  </select>
                )}
              </Field>
              <Field label="Twitter title" help="Defaults to the OG title.">
                {(id) => <Input id={id} value={values.twitter_title} onChange={set("twitter_title")} maxLength={120} />}
              </Field>
            </div>
            <Field label="Twitter description">
              {(id) => <Textarea id={id} rows={2} value={values.twitter_description} onChange={set("twitter_description")} maxLength={320} />}
            </Field>
            <Field label="Twitter image" help="Defaults to the OG image." error={state.fieldErrors?.twitter_image}>
              {(id) => <MediaUrlInput id={id} value={values.twitter_image} onChange={(url) => setValues((prev) => ({ ...prev, twitter_image: url }))} />}
            </Field>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Share preview</p>
            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
              <div className="flex aspect-[1200/630] items-center justify-center bg-muted text-xs text-muted-foreground">
                {values.og_image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- preview of an admin-provided URL
                  <img src={values.og_image} alt="" className="size-full object-cover" />
                ) : (
                  "No OG image — the site default is used"
                )}
              </div>
              <div className="border-t p-3">
                <p className="text-[11px] text-muted-foreground uppercase">magicworkshost.com</p>
                <p className="line-clamp-1 text-sm font-semibold">{values.og_title || previewTitle}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{values.og_description || previewDescription}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {show("schema") ? (
        <Field
          label="Schema.org JSON-LD"
          help={
            schemaError ?? (
              <>
                Paste a JSON-LD object (without the &lt;script&gt; tag), e.g. {"{"} &quot;@context&quot;: &quot;https://schema.org&quot;, &quot;@type&quot;:
                &quot;Service&quot;, … {"}"}. Rendered on CMS-managed pages.
              </>
            )
          }
          error={state.fieldErrors?.schema_json ?? schemaError}
        >
          {(id) => <Textarea id={id} rows={14} value={values.schema_json} onChange={set("schema_json")} className="font-mono text-[13px]" spellCheck={false} />}
        </Field>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>
          <Save />
          Save SEO
        </SubmitButton>
        <FormMessage state={state} className="flex-1" />
      </div>
    </form>
  )
}
