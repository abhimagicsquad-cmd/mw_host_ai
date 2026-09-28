"use client"

import { useActionState } from "react"
import { Save } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updatePageDetailsAction } from "@/lib/admin/actions/pages"
import type { PageRow, PageType } from "@/lib/cms/types"

import { Field, FormMessage, selectClassName, SubmitButton } from "./form-controls"
import { MediaUrlInput } from "./media-picker"
import { PAGE_TYPE_LABELS } from "./ui"

export function PageDetailsForm({ page, canEdit }: { page: PageRow; canEdit: boolean }) {
  const [state, formAction] = useActionState(updatePageDetailsAction.bind(null, page.id), {})
  const [image, setImage] = useState(page.featured_image ?? "")

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-5">
      <fieldset disabled={!canEdit} className="contents">
        <Field label="Title" required error={state.fieldErrors?.title}>
          {(id) => <Input id={id} name="title" defaultValue={page.title} required maxLength={200} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Page type">
            {(id) => (
              <select id={id} name="page_type" defaultValue={page.page_type} className={selectClassName}>
                {(Object.keys(PAGE_TYPE_LABELS) as PageType[]).map((type) => (
                  <option key={type} value={type}>
                    {PAGE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="URL (slug)" required error={state.fieldErrors?.path} help="Changing a live URL breaks existing links to it.">
            {(id) => <Input id={id} name="path" defaultValue={page.path} required className="font-mono text-[13px]" />}
          </Field>
        </div>
        <Field label="Summary / excerpt" help="Used in blog listings and as the fallback meta description.">
          {(id) => <Textarea id={id} name="excerpt" rows={3} defaultValue={page.excerpt ?? ""} maxLength={500} />}
        </Field>
        <Field label="Featured image">
          {(id) => <MediaUrlInput id={id} name="featured_image" value={image} onChange={setImage} />}
        </Field>
        {canEdit ? (
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton>
              <Save />
              Save details
            </SubmitButton>
            <FormMessage state={state} className="flex-1" />
          </div>
        ) : null}
      </fieldset>
    </form>
  )
}
