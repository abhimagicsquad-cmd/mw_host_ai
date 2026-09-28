"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react"

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
    fields.map((field) => [field.name, field.kind === "boolean" ? false : field.kind === "stringList" || field.kind === "objectList" ? [] : field.kind === "cta" ? { label: "", href: "" } : field.kind === "object" ? {} : ""])
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
    case "objectList":
      return <ObjectListField field={field} value={value} onChange={onChange} className={wide} />
    case "object":
      return <ObjectField field={field} value={value} onChange={onChange} />
  }
}

function itemSummary(item: Value) {
  const candidate = item.title ?? item.name ?? item.label ?? item.question ?? item.heading ?? item.tld
  return typeof candidate === "string" && candidate.trim() ? candidate : ""
}

/** Repeatable group. Long lists start collapsed to one summary line per item so pages stay scannable. */
function ObjectListField({
  field,
  value,
  onChange,
  className,
}: {
  field: Extract<FieldDef, { kind: "objectList" }>
  value: unknown
  onChange: (value: unknown) => void
  className: string
}) {
  const items = Array.isArray(value) ? (value as Value[]) : []
  const [open, setOpen] = useState<Set<number>>(() => (items.length <= 3 ? new Set(items.map((_, i) => i)) : new Set()))
  const update = (next: Value[]) => onChange(next)
  const toggle = (index: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <fieldset className={`flex flex-col gap-2 ${className}`}>
      <legend className="mb-2 flex w-full items-center justify-between gap-2 text-sm font-medium">
        <span>
          {field.label} <span className="font-normal text-muted-foreground">({items.length})</span>
        </span>
        {items.length > 3 ? (
          <button
            type="button"
            className="text-xs font-normal text-primary hover:underline"
            onClick={() => setOpen(open.size === items.length ? new Set() : new Set(items.map((_, i) => i)))}
          >
            {open.size === items.length ? "Collapse all" : "Expand all"}
          </button>
        ) : null}
      </legend>
      {field.help ? <p className="-mt-1 mb-1 text-xs text-muted-foreground">{field.help}</p> : null}
      {items.map((item, index) => {
        const isOpen = open.has(index)
        return (
          <div key={index} className="rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <button type="button" onClick={() => toggle(index)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {field.itemLabel} {index + 1}
                </span>
                <span className="truncate text-sm">{itemSummary(item)}</span>
              </button>
              <div className="flex shrink-0 items-center gap-0.5">
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
            {isOpen ? (
              <div className="border-t px-3 py-3">
                <FieldList fields={field.fields} value={item} onChange={(next) => update(items.map((it, i) => (i === index ? next : it)))} />
              </div>
            ) : null}
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => {
          update([...items, emptyItem(field.fields)])
          setOpen((prev) => new Set(prev).add(items.length))
        }}
      >
        <Plus />
        Add {field.itemLabel.toLowerCase()}
      </Button>
    </fieldset>
  )
}

function ObjectField({ field, value, onChange }: { field: Extract<FieldDef, { kind: "object" }>; value: unknown; onChange: (value: unknown) => void }) {
  const [isOpen, setIsOpen] = useState(!field.collapsed)
  const current = (value && typeof value === "object" ? value : {}) as Value
  return (
    <fieldset className="rounded-lg border sm:col-span-2">
      <legend className="sr-only">{field.label}</legend>
      <button type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        <span className="text-sm font-medium">{field.label}</span>
      </button>
      {isOpen ? (
        <div className="border-t px-3 py-3">
          {field.help ? <p className="mb-3 text-xs text-muted-foreground">{field.help}</p> : null}
          <FieldList fields={field.fields} value={current} onChange={onChange} />
        </div>
      ) : null}
    </fieldset>
  )
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
    } else if (field.kind === "object" && current && typeof current === "object") {
      out[field.name] = cleanSectionData(field.fields, current as Value)
    } else if (field.kind === "cta" && current && typeof current === "object") {
      const cta = current as { label?: string; href?: string }
      out[field.name] = cta.label?.trim() && cta.href?.trim() ? { ...cta, label: cta.label.trim(), href: cta.href.trim() } : undefined
    } else if ((field.kind === "text" || field.kind === "textarea") && typeof current === "string") {
      out[field.name] = current.trim()
    }
  }
  return JSON.parse(JSON.stringify(out)) as Value
}
