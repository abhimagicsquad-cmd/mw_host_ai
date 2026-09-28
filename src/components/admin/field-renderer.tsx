"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { type FieldDef, ICON_NAMES } from "@/lib/cms/section-schemas"

import { checkboxClassName, Field, selectClassName } from "./form-controls"
import { MediaUrlInput } from "./media-picker"

type Value = Record<string, unknown>

function str(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value)
}

export function emptyItem(fields: FieldDef[]): Value {
  return Object.fromEntries(
    fields.map((field) => [field.name, field.kind === "boolean" ? false : field.kind === "stringList" || field.kind === "objectList" ? [] : field.kind === "cta" ? { label: "", href: "" } : ""])
  )
}

/** Renders a form for `fields` against `value`, reporting changes as a new object. */
export function FieldList({ fields, value, onChange }: { fields: FieldDef[]; value: Value; onChange: (next: Value) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={value[field.name]}
          onChange={(fieldValue) => onChange({ ...value, [field.name]: fieldValue })}
        />
      ))}
    </div>
  )
}

const WIDE_KINDS = new Set(["textarea", "markdown", "stringList", "cta", "objectList", "image"])

function FieldRenderer({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (value: unknown) => void }) {
  const wide = WIDE_KINDS.has(field.kind) ? "sm:col-span-2" : ""
  const help = "help" in field ? field.help : undefined
  const required = "required" in field ? field.required : undefined

  switch (field.kind) {
    case "text":
      return (
        <Field label={field.label} help={help} required={required} className={wide}>
          {(id) => <Input id={id} value={str(value)} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />}
        </Field>
      )
    case "textarea":
      return (
        <Field label={field.label} help={help} required={required} className={wide}>
          {(id) => <Textarea id={id} rows={field.rows ?? 3} value={str(value)} onChange={(e) => onChange(e.target.value)} />}
        </Field>
      )
    case "markdown":
      return (
        <Field label={field.label} help={help} required={required} className={wide}>
          {(id) => <Textarea id={id} rows={14} value={str(value)} onChange={(e) => onChange(e.target.value)} className="font-mono text-[13px] leading-relaxed" />}
        </Field>
      )
    case "number":
      return (
        <Field label={field.label} className={wide}>
          {(id) => (
            <Input
              id={id}
              type="number"
              min={field.min}
              max={field.max}
              value={value === undefined || value === null ? "" : String(value)}
              onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            />
          )}
        </Field>
      )
    case "boolean":
      return (
        <label className="flex items-center gap-2.5 self-end pb-1.5 text-sm font-medium">
          <input type="checkbox" className={checkboxClassName} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
      )
    case "select":
      return (
        <Field label={field.label} className={wide}>
          {(id) => (
            <select id={id} className={selectClassName} value={str(value)} onChange={(e) => onChange(e.target.value)}>
              <option value="">— Default —</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      )
    case "icon":
      return (
        <Field label={field.label} className={wide}>
          {(id) => (
            <select id={id} className={selectClassName} value={str(value)} onChange={(e) => onChange(e.target.value || undefined)}>
              <option value="">— None —</option>
              {(str(value) && !ICON_NAMES.includes(str(value)) ? [str(value), ...ICON_NAMES] : ICON_NAMES).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </Field>
      )
    case "image":
      return (
        <Field label={field.label} className={wide}>
          {(id) => <MediaUrlInput id={id} value={str(value)} onChange={onChange} />}
        </Field>
      )
    case "stringList":
      return (
        <Field label={field.label} help={help ?? "One item per line."} className={wide}>
          {(id) => (
            <Textarea
              id={id}
              rows={4}
              value={Array.isArray(value) ? value.join("\n") : ""}
              // Raw lines while typing; blank lines are dropped by cleanSectionData() on save.
              onChange={(e) => onChange(e.target.value.split("\n"))}
            />
          )}
        </Field>
      )
    case "cta": {
      const cta = (value && typeof value === "object" ? value : {}) as { label?: string; href?: string; external?: boolean }
      return (
        <fieldset className={`rounded-lg border p-3 ${wide}`}>
          <legend className="px-1 text-sm font-medium">{field.label}</legend>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Label">{(id) => <Input id={id} value={cta.label ?? ""} onChange={(e) => onChange({ ...cta, label: e.target.value })} />}</Field>
            <Field label="Link" help="#lead opens the lead form">
              {(id) => <Input id={id} value={cta.href ?? ""} placeholder="/hosting or #pricing" onChange={(e) => onChange({ ...cta, href: e.target.value })} />}
            </Field>
            <label className="flex items-center gap-2 pb-6 text-sm">
              <input type="checkbox" className={checkboxClassName} checked={Boolean(cta.external)} onChange={(e) => onChange({ ...cta, external: e.target.checked })} />
              New tab
            </label>
          </div>
        </fieldset>
      )
    }
    case "objectList": {
      const items = Array.isArray(value) ? (value as Value[]) : []
      const update = (next: Value[]) => onChange(next)
      return (
        <fieldset className={`flex flex-col gap-3 ${wide}`}>
          <legend className="mb-2 text-sm font-medium">
            {field.label} <span className="font-normal text-muted-foreground">({items.length})</span>
          </legend>
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {field.itemLabel} {index + 1}
                  {typeof (item.title ?? item.name ?? item.label ?? item.question) === "string" && (item.title ?? item.name ?? item.label ?? item.question)
                    ? ` · ${String(item.title ?? item.name ?? item.label ?? item.question)}`
                    : ""}
                </p>
                <div className="flex items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Move up" disabled={index === 0} onClick={() => update(move(items, index, -1))}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Move down" disabled={index === items.length - 1} onClick={() => update(move(items, index, 1))}>
                    <ArrowDown />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${field.itemLabel}`} onClick={() => update(items.filter((_, i) => i !== index))}>
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </div>
              <FieldList fields={field.fields} value={item} onChange={(next) => update(items.map((it, i) => (i === index ? next : it)))} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => update([...items, emptyItem(field.fields)])}>
            <Plus />
            Add {field.itemLabel.toLowerCase()}
          </Button>
        </fieldset>
      )
    }
  }
}

export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

/** Trims strings, drops blank lines from string lists and empty CTAs — run before saving. */
export function cleanSectionData(fields: FieldDef[], value: Value): Value {
  const out: Value = { ...value }
  for (const field of fields) {
    const current = out[field.name]
    if (field.kind === "stringList" && Array.isArray(current)) {
      out[field.name] = current.map((line) => String(line).trim()).filter(Boolean)
    } else if (field.kind === "objectList" && Array.isArray(current)) {
      out[field.name] = (current as Value[]).map((item) => cleanSectionData(field.fields, item))
    } else if (field.kind === "cta" && current && typeof current === "object") {
      const cta = current as { label?: string; href?: string }
      out[field.name] = cta.label?.trim() && cta.href?.trim() ? { ...cta, label: cta.label.trim(), href: cta.href.trim() } : undefined
    } else if ((field.kind === "text" || field.kind === "textarea") && typeof current === "string") {
      out[field.name] = current.trim()
    }
  }
  return JSON.parse(JSON.stringify(out)) as Value
}
