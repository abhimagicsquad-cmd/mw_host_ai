"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveMenuAction } from "@/lib/admin/actions/menus"
import { ICON_NAMES } from "@/lib/cms/section-schemas"
import type { ActionState, MenuLocation } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { move } from "./field-renderer"
import { checkboxClassName, FormMessage, selectClassName } from "./form-controls"

type Link = { label: string; href: string; icon?: string; external?: boolean }
type Column = { heading?: string; links: Link[] }
type HeaderItem = { label: string; href?: string; external?: boolean; columns?: Column[]; featured?: { title: string; description?: string; href: string; icon?: string } }

function IconSelect({ value, onChange }: { value?: string; onChange: (value?: string) => void }) {
  const options = value && !ICON_NAMES.includes(value) ? [value, ...ICON_NAMES] : ICON_NAMES
  return (
    <select aria-label="Icon" className={cn(selectClassName, "w-36")} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
      <option value="">No icon</option>
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  )
}

function Reorder({ index, length, onMove, onRemove, label }: { index: number; length: number; onMove: (delta: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center">
      <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${label} down`} disabled={index === length - 1} onClick={() => onMove(1)}>
        <ArrowDown />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${label}`} onClick={onRemove}>
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  )
}

function ColumnEditor({ column, onChange, showHeading = true }: { column: Column; onChange: (column: Column) => void; showHeading?: boolean }) {
  const links = column.links ?? []
  const setLinks = (next: Link[]) => onChange({ ...column, links: next })
  return (
    <div className="flex flex-col gap-2">
      {showHeading ? (
        <Input value={column.heading ?? ""} onChange={(e) => onChange({ ...column, heading: e.target.value })} placeholder="Column heading (optional)" aria-label="Column heading" className="font-medium" />
      ) : null}
      {links.map((link, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
          <Input value={link.label} onChange={(e) => setLinks(links.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)))} placeholder="Label" aria-label="Link label" className="min-w-32 flex-1" />
          <Input value={link.href} onChange={(e) => setLinks(links.map((l, i) => (i === index ? { ...l, href: e.target.value } : l)))} placeholder="/path or https://…" aria-label="Link URL" className="min-w-40 flex-1 font-mono text-[13px]" />
          <IconSelect value={link.icon} onChange={(icon) => setLinks(links.map((l, i) => (i === index ? { ...l, icon } : l)))} />
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" className={checkboxClassName} checked={Boolean(link.external)} onChange={(e) => setLinks(links.map((l, i) => (i === index ? { ...l, external: e.target.checked } : l)))} />
            New tab
          </label>
          <Reorder index={index} length={links.length} label="link" onMove={(d) => setLinks(move(links, index, d))} onRemove={() => setLinks(links.filter((_, i) => i !== index))} />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setLinks([...links, { label: "", href: "" }])}>
        <Plus />
        Add link
      </Button>
    </div>
  )
}

export function MenuEditor({ location, initialItems, source }: { location: MenuLocation; initialItems: unknown[]; source: "cms" | "sanity" | "default" }) {
  const router = useRouter()
  const [items, setItems] = useState<unknown[]>(() => structuredClone(initialItems))
  const [saved, setSaved] = useState(() => JSON.stringify(initialItems))
  const [expanded, setExpanded] = useState<number | null>(null)
  const [state, setState] = useState<ActionState>()
  const [saving, startSaving] = useTransition()
  const dirty = useMemo(() => JSON.stringify(items) !== saved, [items, saved])

  function save() {
    startSaving(async () => {
      const result = await saveMenuAction(location, JSON.stringify(items))
      setState(result)
      if (!result.error) {
        setSaved(JSON.stringify(items))
        router.refresh()
      }
    })
  }

  const header = items as HeaderItem[]
  const footer = items as Column[]

  return (
    <div className="flex flex-col gap-4">
      {source !== "cms" ? (
        <p className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          This is the menu currently live on the website ({source === "sanity" ? "from Sanity" : "built-in default"}). Saving makes the CMS its source from now on.
        </p>
      ) : null}

      {location === "header"
        ? header.map((item, index) => {
            const open = expanded === index
            const patch = (next: Partial<HeaderItem>) => setItems(header.map((it, i) => (i === index ? { ...it, ...next } : it)))
            return (
              <div key={index} className="rounded-xl border bg-card shadow-xs">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <Input value={item.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Menu label" aria-label="Menu label" className="w-40 font-medium" />
                  <Input value={item.href ?? ""} onChange={(e) => patch({ href: e.target.value })} placeholder="/link (optional for dropdowns)" aria-label="Menu link" className="min-w-40 flex-1 font-mono text-[13px]" />
                  <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(open ? null : index)} aria-expanded={open}>
                    Dropdown ({item.columns?.reduce((n, c) => n + (c.links?.length ?? 0), 0) ?? 0})
                    <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
                  </Button>
                  <Reorder index={index} length={header.length} label="menu item" onMove={(d) => setItems(move(header, index, d))} onRemove={() => setItems(header.filter((_, i) => i !== index))} />
                </div>
                {open ? (
                  <div className="flex flex-col gap-4 border-t bg-muted/20 p-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {(item.columns ?? []).map((column, columnIndex) => (
                        <div key={columnIndex} className="rounded-lg border bg-card p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Column {columnIndex + 1}</p>
                            <Reorder
                              index={columnIndex}
                              length={item.columns!.length}
                              label="column"
                              onMove={(d) => patch({ columns: move(item.columns!, columnIndex, d) })}
                              onRemove={() => patch({ columns: item.columns!.filter((_, i) => i !== columnIndex) })}
                            />
                          </div>
                          <ColumnEditor column={column} onChange={(next) => patch({ columns: item.columns!.map((c, i) => (i === columnIndex ? next : c)) })} />
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => patch({ columns: [...(item.columns ?? []), { heading: "", links: [] }] })}>
                      <Plus />
                      Add dropdown column
                    </Button>
                    <fieldset className="rounded-lg border bg-card p-3">
                      <legend className="px-1 text-sm font-medium">Featured card (optional)</legend>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input value={item.featured?.title ?? ""} onChange={(e) => patch({ featured: { href: "", ...item.featured, title: e.target.value } })} placeholder="Title" aria-label="Featured title" />
                        <Input value={item.featured?.href ?? ""} onChange={(e) => patch({ featured: { title: "", ...item.featured, href: e.target.value } })} placeholder="/link" aria-label="Featured link" className="font-mono text-[13px]" />
                        <Input
                          value={item.featured?.description ?? ""}
                          onChange={(e) => patch({ featured: { title: "", href: "", ...item.featured, description: e.target.value } })}
                          placeholder="Short description"
                          aria-label="Featured description"
                          className="sm:col-span-2"
                        />
                      </div>
                    </fieldset>
                  </div>
                ) : null}
              </div>
            )
          })
        : footer.map((column, index) => (
            <div key={index} className="rounded-xl border bg-card p-4 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Footer column {index + 1}</p>
                <Reorder index={index} length={footer.length} label="column" onMove={(d) => setItems(move(footer, index, d))} onRemove={() => setItems(footer.filter((_, i) => i !== index))} />
              </div>
              <ColumnEditor column={column} onChange={(next) => setItems(footer.map((c, i) => (i === index ? next : c)))} />
            </div>
          ))}

      <Button
        type="button"
        variant="outline"
        className="self-start border-dashed"
        onClick={() => setItems([...items, location === "header" ? { label: "", href: "" } : { heading: "", links: [] }])}
      >
        <Plus />
        {location === "header" ? "Add menu item" : "Add footer column"}
      </Button>

      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/90 px-4 py-3 backdrop-blur">
        {state ? (
          <FormMessage state={state} className="py-1" />
        ) : (
          <span className={cn("text-sm", dirty ? "font-medium text-admin-secondary" : "text-muted-foreground")}>{dirty ? "Unsaved changes" : "No changes"}</span>
        )}
        <Button onClick={save} disabled={saving || (!dirty && source === "cms")}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save menu
        </Button>
      </div>
    </div>
  )
}
