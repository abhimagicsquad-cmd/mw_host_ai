"use client"

import { useActionState, useState } from "react"
import { FilePlus2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createPageAction } from "@/lib/admin/actions/pages"
import { slugify } from "@/lib/cms/paths"
import type { PageType } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { Field, FormMessage, selectClassName, SubmitButton } from "./form-controls"
import { PAGE_TYPE_LABELS } from "./ui"

const STARTERS = [
  { value: "basic", label: "Basic page", description: "Page header + rich text" },
  { value: "landing", label: "Landing page", description: "Header, features, FAQ and CTA" },
  { value: "blank", label: "Blank", description: "Start with no sections" },
]

function suggestPath(title: string, type: PageType) {
  const slug = slugify(title)
  if (type === "home") return "/"
  if (type === "blog") return `/blog/${slug}`
  return `/${slug}`
}

export function NewPageForm({ defaultType, hasHome }: { defaultType: PageType; hasHome: boolean }) {
  const [state, formAction] = useActionState(createPageAction, {})
  const [title, setTitle] = useState("")
  const [type, setType] = useState<PageType>(defaultType)
  const [path, setPath] = useState(suggestPath("", defaultType))
  const [pathTouched, setPathTouched] = useState(false)
  const [starter, setStarter] = useState(defaultType === "blog" ? "blog" : "basic")

  const types = (Object.keys(PAGE_TYPE_LABELS) as PageType[]).filter((t) => t !== "home" || !hasHome || defaultType === "home")

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-xs">
        <Field label="Page title" required error={state.fieldErrors?.title}>
          {(id) => (
            <Input
              id={id}
              name="title"
              required
              value={title}
              maxLength={200}
              onChange={(event) => {
                setTitle(event.target.value)
                if (!pathTouched) setPath(suggestPath(event.target.value, type))
              }}
              placeholder="e.g. Cloud Hosting"
            />
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Page type" required>
            {(id) => (
              <select
                id={id}
                name="page_type"
                className={selectClassName}
                value={type}
                onChange={(event) => {
                  const next = event.target.value as PageType
                  setType(next)
                  if (!pathTouched) setPath(suggestPath(title, next))
                  if (next === "blog") setStarter("blog")
                  else if (starter === "blog") setStarter("basic")
                }}
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {PAGE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            label="URL (slug)"
            required
            error={state.fieldErrors?.path}
            help={type === "blog" ? "Blog posts live under /blog/…" : "Lowercase letters, numbers and dashes."}
          >
            {(id) => (
              <Input
                id={id}
                name="path"
                required
                value={path}
                onChange={(event) => {
                  setPathTouched(true)
                  setPath(event.target.value)
                }}
                className="font-mono text-[13px]"
              />
            )}
          </Field>
        </div>
        <Field label={type === "blog" ? "Excerpt" : "Summary"} help="Shown in blog listings and used as the default meta description.">
          {(id) => <Textarea id={id} name="excerpt" rows={3} maxLength={500} />}
        </Field>
        <FormMessage state={state} />
      </div>

      <div className="flex flex-col gap-4">
        {type !== "blog" ? (
          <fieldset className="rounded-xl border bg-card p-5 shadow-xs">
            <legend className="sr-only">Starting layout</legend>
            <p className="mb-3 text-sm font-medium">Starting layout</p>
            <div className="flex flex-col gap-2">
              {STARTERS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    starter === option.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="starter"
                    value={option.value}
                    checked={starter === option.value}
                    onChange={() => setStarter(option.value)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <input type="hidden" name="starter" value="blog" />
        )}
        <SubmitButton size="lg" pendingLabel="Creating…">
          <FilePlus2 />
          Create page
        </SubmitButton>
        <p className="text-xs text-muted-foreground">New pages start as drafts. Publish them from the editor when they&apos;re ready.</p>
      </div>
    </form>
  )
}
