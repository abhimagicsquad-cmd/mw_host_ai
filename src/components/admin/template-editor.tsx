"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { saveTemplateAction } from "@/lib/admin/actions/pages"
import { type TemplateKey, templates } from "@/lib/cms/templates"
import type { ActionState } from "@/lib/cms/types"

import { cleanSectionData, FieldList } from "./field-renderer"
import { FormMessage } from "./form-controls"

/** Form editor for a structured template page (service, legal, blog post…). */
export function TemplateEditor({ pageId, template, initialData, canEdit }: { pageId: string; template: TemplateKey; initialData: Record<string, unknown>; canEdit: boolean }) {
  const router = useRouter()
  const def = templates[template]
  const [data, setData] = useState<Record<string, unknown>>(() => ({ ...def.defaults, ...initialData }))
  const [saved, setSaved] = useState(() => JSON.stringify({ ...def.defaults, ...initialData }))
  const [state, setState] = useState<ActionState>()
  const [saving, startSaving] = useTransition()
  const dirty = useMemo(() => JSON.stringify(data) !== saved, [data, saved])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function save() {
    const cleaned = cleanSectionData(def.fields, data)
    startSaving(async () => {
      const result = await saveTemplateAction(pageId, JSON.stringify(cleaned))
      setState(result)
      if (!result.error) {
        setData(cleaned)
        setSaved(JSON.stringify(cleaned))
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{def.label}.</span> This page keeps the website&apos;s standard design — edit its text, lists and FAQs below.
        </p>
        <fieldset disabled={!canEdit} className="contents">
          <FieldList
            fields={def.fields}
            value={data}
            onChange={(next) => {
              setData(next)
              setState(undefined)
            }}
          />
        </fieldset>
      </div>

      {canEdit ? (
        <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <div className="min-w-0 text-sm">
            {state ? (
              <FormMessage state={state} className="py-1" />
            ) : dirty ? (
              <span className="flex items-center gap-2 font-medium text-admin-secondary">
                <span className="size-2 rounded-full bg-admin-secondary" aria-hidden />
                Unsaved changes
              </span>
            ) : (
              <span className="text-muted-foreground">All changes saved</span>
            )}
          </div>
          <div className="flex gap-2">
            {dirty ? (
              <Button variant="ghost" disabled={saving} onClick={() => setData(JSON.parse(saved))}>
                Discard
              </Button>
            ) : null}
            <Button onClick={save} disabled={!dirty || saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Save content
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
