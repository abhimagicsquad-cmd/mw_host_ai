"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { savePricingPlansAction } from "@/lib/admin/actions/pricing"
import type { FieldDef } from "@/lib/cms/section-schemas"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { cleanSectionData, FieldList } from "./field-renderer"
import { checkboxClassName, FormMessage } from "./form-controls"

type Plan = Record<string, unknown>

export function PricingEditor({
  initialPlans,
  initialPublished,
  fields,
  canPublish,
}: {
  initialPlans: Plan[]
  initialPublished: boolean
  fields: FieldDef[]
  canPublish: boolean
}) {
  const router = useRouter()
  const listField: FieldDef = { kind: "objectList", name: "plans", label: "Plans", itemLabel: "Plan", fields }
  const [value, setValue] = useState<Record<string, unknown>>({ plans: initialPlans })
  const [published, setPublished] = useState(initialPublished)
  const [saved, setSaved] = useState(() => JSON.stringify({ plans: initialPlans, published: initialPublished }))
  const [state, setState] = useState<ActionState>()
  const [saving, startSaving] = useTransition()
  const dirty = useMemo(() => JSON.stringify({ plans: value.plans, published }) !== saved, [value, published, saved])
  const plans = (value.plans as Plan[]) ?? []
  const byService = plans.reduce<Record<string, number>>((acc, plan) => {
    const service = String(plan.service || "other")
    acc[service] = (acc[service] ?? 0) + 1
    return acc
  }, {})

  function save() {
    const cleaned = cleanSectionData([listField], value).plans as Plan[]
    startSaving(async () => {
      const result = await savePricingPlansAction(JSON.stringify(cleaned), published)
      setState(result)
      if (!result.error) {
        setValue({ plans: cleaned })
        setSaved(JSON.stringify({ plans: cleaned, published }))
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4", published ? "border-emerald-300/60 bg-emerald-50 dark:bg-emerald-500/10" : "bg-card")}>
        <div className="text-sm">
          <p className="font-medium">{published ? "The website uses these plans" : "Draft — the website still uses the Sanity plans"}</p>
          <p className="text-muted-foreground">
            {Object.entries(byService)
              .map(([service, count]) => `${service}: ${count}`)
              .join(" · ")}
          </p>
        </div>
        <label className={cn("flex items-center gap-2 text-sm font-medium", !canPublish && "opacity-50")}>
          <input type="checkbox" className={checkboxClassName} checked={published} disabled={!canPublish} onChange={(e) => setPublished(e.target.checked)} />
          Use these plans on the website
        </label>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
        <FieldList fields={[listField]} value={value} onChange={(next) => { setValue(next); setState(undefined) }} />
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        {state ? (
          <FormMessage state={state} className="py-1" />
        ) : (
          <span className={cn("text-sm", dirty ? "font-medium text-admin-secondary" : "text-muted-foreground")}>{dirty ? "Unsaved changes" : "All changes saved"}</span>
        )}
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save plans
        </Button>
      </div>
    </div>
  )
}
