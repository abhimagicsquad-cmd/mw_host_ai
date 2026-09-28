"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  LayoutTemplate,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveSectionsAction } from "@/lib/admin/actions/pages"
import { sectionSchemaMap, sectionSchemas, summarizeSection, type SectionSchema } from "@/lib/cms/section-schemas"
import type { ActionState, SectionType } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { cleanSectionData, FieldList, move } from "./field-renderer"
import { FormMessage } from "./form-controls"
import { EmptyState } from "./ui"

export type EditableSection = { id: string; type: SectionType; data: Record<string, unknown>; is_visible: boolean }

const GROUPS: SectionSchema["group"][] = ["Hero", "Content", "Conversion", "Social proof"]

function snapshot(sections: EditableSection[]) {
  return JSON.stringify(sections.map(({ id, type, data, is_visible }) => ({ id, type, data, is_visible })))
}

export function SectionBuilder({ pageId, initialSections, canEdit }: { pageId: string; initialSections: EditableSection[]; canEdit: boolean }) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [saved, setSaved] = useState(() => snapshot(initialSections))
  const [expanded, setExpanded] = useState<string | null>(initialSections.length === 1 ? initialSections[0].id : null)
  const [pickerAt, setPickerAt] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [state, setState] = useState<ActionState>()
  const [saving, startSaving] = useTransition()

  const dirty = useMemo(() => snapshot(sections) !== saved, [sections, saved])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function update(id: string, patch: Partial<EditableSection>) {
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...patch } : section)))
    setState(undefined)
  }

  function addSection(type: SectionType, at: number) {
    const section: EditableSection = { id: crypto.randomUUID(), type, data: structuredClone(sectionSchemaMap[type].defaults), is_visible: true }
    setSections((prev) => [...prev.slice(0, at), section, ...prev.slice(at)])
    setExpanded(section.id)
    setPickerAt(null)
  }

  function save() {
    const cleaned = sections.map((section) => ({ ...section, data: cleanSectionData(sectionSchemaMap[section.type].fields, section.data) }))
    startSaving(async () => {
      const result = await saveSectionsAction(pageId, JSON.stringify(cleaned))
      setState(result)
      if (!result.error) {
        setSections(cleaned)
        setSaved(snapshot(cleaned))
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card">
          <EmptyState
            icon={LayoutTemplate}
            title="This page has no sections yet"
            description="Sections are the building blocks of the page — hero, features, pricing, FAQ, call to action and more."
            action={
              canEdit ? (
                <Button onClick={() => setPickerAt(0)}>
                  <Plus />
                  Add first section
                </Button>
              ) : null
            }
          />
        </div>
      ) : null}

      {sections.map((section, index) => {
        const schema = sectionSchemaMap[section.type]
        const isOpen = expanded === section.id
        return (
          <div
            key={section.id}
            onDragOver={(event) => {
              if (dragIndex === null || dragIndex === index) return
              event.preventDefault()
              setSections((prev) => move(prev, dragIndex, index - dragIndex))
              setDragIndex(index)
            }}
            className={cn(
              "rounded-xl border bg-card shadow-xs transition-shadow",
              !section.is_visible && "opacity-60",
              dragIndex === index && "ring-2 ring-primary/40",
              isOpen && "ring-1 ring-primary/30"
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              {canEdit ? (
                <span
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move"
                    setDragIndex(index)
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                  aria-hidden
                  title="Drag to reorder"
                >
                  <GripVertical className="size-4" />
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : section.id)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">{schema?.label ?? section.type}</span>
                  <span className="block truncate text-sm font-medium">{summarizeSection(section.type, section.data)}</span>
                </span>
                <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </button>
              {canEdit ? (
                <div className="flex shrink-0 items-center">
                  <Button variant="ghost" size="icon-sm" aria-label="Move up" disabled={index === 0} onClick={() => setSections((prev) => move(prev, index, -1))}>
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={index === sections.length - 1}
                    onClick={() => setSections((prev) => move(prev, index, 1))}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={section.is_visible ? "Hide section" : "Show section"}
                    title={section.is_visible ? "Hide on website" : "Show on website"}
                    onClick={() => update(section.id, { is_visible: !section.is_visible })}
                  >
                    {section.is_visible ? <Eye /> : <EyeOff />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Duplicate section"
                    onClick={() =>
                      setSections((prev) => [
                        ...prev.slice(0, index + 1),
                        { ...section, id: crypto.randomUUID(), data: structuredClone(section.data) },
                        ...prev.slice(index + 1),
                      ])
                    }
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete section"
                    onClick={() => {
                      if (window.confirm(`Remove the “${schema?.label ?? section.type}” section? (Takes effect when you save.)`)) {
                        setSections((prev) => prev.filter((s) => s.id !== section.id))
                      }
                    }}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              ) : null}
            </div>
            {isOpen && schema ? (
              <div className="border-t px-4 py-4 sm:px-5">
                <fieldset disabled={!canEdit} className="contents">
                  <FieldList fields={schema.fields} value={section.data} onChange={(data) => update(section.id, { data })} />
                </fieldset>
                {canEdit ? (
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setPickerAt(index + 1)}>
                      <Plus />
                      Insert section below
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}

      {canEdit && sections.length > 0 ? (
        <Button variant="outline" className="self-start border-dashed" onClick={() => setPickerAt(sections.length)}>
          <Plus />
          Add section
        </Button>
      ) : null}

      {canEdit ? (
        <div className="sticky bottom-0 z-20 -mx-4 mt-2 flex flex-wrap items-center justify-between gap-3 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
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
              <Button
                variant="ghost"
                onClick={() => {
                  setSections(JSON.parse(saved) as EditableSection[])
                  setState(undefined)
                }}
                disabled={saving}
              >
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

      <Dialog open={pickerAt !== null} onOpenChange={(open) => !open && setPickerAt(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a section</DialogTitle>
            <DialogDescription>Each section uses the website&apos;s existing design — you only fill in the content.</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto">
            {GROUPS.map((group) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sectionSchemas
                    .filter((schema) => schema.group === group)
                    .map((schema) => (
                      <button
                        key={schema.type}
                        type="button"
                        onClick={() => addSection(schema.type, pickerAt ?? sections.length)}
                        className="rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <span className="block text-sm font-medium">{schema.label}</span>
                        <span className="block text-xs text-muted-foreground">{schema.description}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
