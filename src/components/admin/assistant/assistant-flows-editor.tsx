"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { serviceOptions } from "@/constants/service-options"
import { saveAssistantSectionAction } from "@/lib/admin/actions/assistant"
import { FLOW_OPTION_KINDS, PLAN_CATEGORIES, type ActionKind, type ConversationFlow, type FlowStepNode, type FlowStepOption } from "@/lib/assistant/types"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { move } from "../field-renderer"
import { Field, FormMessage, selectClassName } from "../form-controls"

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30) || newId("flow")

function Controls({ index, length, onMove, onRemove, label, size = "icon-xs" }: { index: number; length: number; onMove: (delta: number) => void; onRemove: () => void; label: string; size?: "icon-xs" | "icon-sm" }) {
  return (
    <div className="flex shrink-0 items-center">
      <Button type="button" variant="ghost" size={size} aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size={size} aria-label={`Move ${label} down`} disabled={index === length - 1} onClick={() => onMove(1)}>
        <ArrowDown />
      </Button>
      <Button type="button" variant="ghost" size={size} aria-label={`Delete ${label}`} onClick={onRemove}>
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  )
}

function OptionValue({ option, flow, flows, onChange }: { option: FlowStepOption; flow: ConversationFlow; flows: ConversationFlow[]; onChange: (value: string | undefined) => void }) {
  const select = (label: string, choices: { value: string; label: string }[]) => (
    <select aria-label={label} className={selectClassName} value={option.value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
      <option value="">{label}…</option>
      {choices.map((choice) => (
        <option key={choice.value} value={choice.value}>
          {choice.label}
        </option>
      ))}
    </select>
  )
  switch (option.kind) {
    case "recommend":
      return <p className="self-center text-xs text-muted-foreground">Starts the plan recommendation questions.</p>
    case "step":
      return select("Choose a step", flow.steps.map((s, i) => ({ value: s.id, label: `${i + 1}. ${s.message.replace(/\*\*/g, "").slice(0, 50) || s.id}` })))
    case "flow":
      return select("Choose a flow", flows.filter((f) => f.id !== flow.id).map((f) => ({ value: f.id, label: f.name || f.id })))
    case "plans":
      return select("Choose a category", PLAN_CATEGORIES.map((c) => ({ value: c.value, label: c.label })))
    case "lead":
      return select("Service for the enquiry", serviceOptions.map((s) => ({ value: s.value, label: s.label })))
    case "link":
      return <Input aria-label="URL" value={option.value ?? ""} maxLength={300} placeholder="/page/, https://…, tel:+91…" onChange={(e) => onChange(e.target.value || undefined)} />
    case "ask":
      return <Input aria-label="Question to answer" value={option.value ?? ""} maxLength={300} placeholder="e.g. Do you offer free SSL?" onChange={(e) => onChange(e.target.value || undefined)} />
  }
}

function StepEditor({
  step,
  index,
  flow,
  flows,
  onChange,
  onMove,
  onRemove,
}: {
  step: FlowStepNode
  index: number
  flow: ConversationFlow
  flows: ConversationFlow[]
  onChange: (step: FlowStepNode) => void
  onMove: (delta: number) => void
  onRemove: () => void
}) {
  const setOption = (i: number, patch: Partial<FlowStepOption>) => onChange({ ...step, options: step.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) })
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-2">
        <span className={cn("mt-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", index === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
          {index === 0 ? "Start" : `Step ${index + 1}`}
        </span>
        <div className="flex-1">
          <Textarea
            aria-label={`Message for step ${index + 1}`}
            rows={3}
            maxLength={1500}
            value={step.message}
            placeholder="What the assistant says. Use **bold** and start lines with • for bullet points."
            onChange={(e) => onChange({ ...step, message: e.target.value })}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Step id: {step.id}</p>
        </div>
        <Controls index={index} length={flow.steps.length} label={`step ${index + 1}`} onMove={onMove} onRemove={onRemove} />
      </div>
      <div className="mt-3 flex flex-col gap-2 border-l-2 pl-3 sm:ml-12">
        <p className="text-xs font-medium text-muted-foreground">Buttons ({step.options.length}/8)</p>
        {step.options.map((option, i) => (
          <div key={option.id} className="grid gap-2 rounded-md bg-muted/40 p-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.3fr)_auto] lg:items-start">
            <Input aria-label="Button label" value={option.label} maxLength={60} placeholder="Button label" onChange={(e) => setOption(i, { label: e.target.value })} />
            <select aria-label="What it does" className={selectClassName} value={option.kind} onChange={(e) => setOption(i, { kind: e.target.value as ActionKind, value: undefined })}>
              {FLOW_OPTION_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            <OptionValue option={option} flow={flow} flows={flows} onChange={(value) => setOption(i, { value })} />
            <Controls
              index={i}
              length={step.options.length}
              label={option.label || "button"}
              onMove={(delta) => onChange({ ...step, options: move(step.options, i, delta) })}
              onRemove={() => onChange({ ...step, options: step.options.filter((_, j) => j !== i) })}
            />
            <Input
              aria-label="Optional reply when chosen"
              className="lg:col-span-3"
              value={option.response ?? ""}
              maxLength={600}
              placeholder="Optional reply shown when this button is chosen (e.g. “Great choice!”)"
              onChange={(e) => setOption(i, { response: e.target.value || undefined })}
            />
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" className="w-fit" disabled={step.options.length >= 8} onClick={() => onChange({ ...step, options: [...step.options, { id: newId("op"), label: "", kind: "step" }] })}>
          <Plus />
          Add button
        </Button>
      </div>
    </div>
  )
}

/** Admin → Hosting Assistant → Conversation Flows: create, edit, delete and reorder guided flows. */
export function AssistantFlowsEditor({ initial, usedBy }: { initial: ConversationFlow[]; usedBy: Record<string, string[]> }) {
  const router = useRouter()
  const [flows, setFlows] = useState(initial)
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null)
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<ActionState>()
  const [triggerText, setTriggerText] = useState<Record<string, string>>(() => Object.fromEntries(initial.map((f) => [f.id, f.triggers.join(", ")])))

  const update = (index: number, patch: Partial<ConversationFlow>) => setFlows((list) => list.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  const save = () =>
    startTransition(async () => {
      const payload = flows.map((flow) => ({
        ...flow,
        triggers: (triggerText[flow.id] ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      }))
      const result = await saveAssistantSectionAction("flows", JSON.stringify({ flows: payload }))
      setState(result)
      if (!result.error) router.refresh()
    })

  function addFlow() {
    const id = newId("flow")
    setFlows((list) => [...list, { id, name: "", triggers: [], steps: [{ id: "start", message: "", options: [] }] }])
    setTriggerText((t) => ({ ...t, [id]: "" }))
    setOpen(id)
  }

  return (
    <div className="flex flex-col gap-4">
      {flows.map((flow, index) => {
        const expanded = open === flow.id
        const uses = usedBy[flow.id] ?? []
        return (
          <section key={flow.id} className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button type="button" onClick={() => setOpen(expanded ? null : flow.id)} aria-expanded={expanded} className="rounded-md p-1 hover:bg-muted" aria-label={expanded ? "Collapse flow" : "Expand flow"}>
                <ChevronDown className={cn("size-4 transition-transform", !expanded && "-rotate-90")} />
              </button>
              <Input aria-label="Flow name" value={flow.name} maxLength={60} placeholder="Flow name (e.g. Need Faster Website)" onChange={(e) => update(index, { name: e.target.value })} className="max-w-xs font-medium" />
              <span className="text-xs text-muted-foreground">
                {flow.steps.length} {flow.steps.length === 1 ? "step" : "steps"}
                {uses.length ? ` · used by ${uses.join(", ")}` : ""}
              </span>
              <div className="ml-auto">
                <Controls
                  size="icon-sm"
                  index={index}
                  length={flows.length}
                  label={flow.name || "flow"}
                  onMove={(delta) => setFlows((list) => move(list, index, delta))}
                  onRemove={() => setFlows((list) => list.filter((_, i) => i !== index))}
                />
              </div>
            </div>
            {expanded ? (
              <div className="flex flex-col gap-4 border-t p-4">
                <div className="grid gap-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
                  <Field label="Flow id" help="Used by quick actions, starters and other flows.">
                    {(id) => (
                      <Input
                        id={id}
                        defaultValue={flow.id}
                        maxLength={40}
                        // Applied on blur: the id keys this section, so changing it per keystroke would lose focus.
                        onBlur={(e) => {
                          const next = slug(e.target.value)
                          if (next === flow.id) return
                          setTriggerText((t) => ({ ...t, [next]: t[flow.id] ?? "" }))
                          update(index, { id: next })
                          setOpen(next)
                        }}
                        className="font-mono text-xs"
                        disabled={uses.length > 0}
                      />
                    )}
                  </Field>
                  <Field label="Triggers" help="Comma separated words or phrases that start this flow when a visitor types them, e.g. slow, speed up, performance">
                    {(id) => <Input id={id} value={triggerText[flow.id] ?? ""} onChange={(e) => setTriggerText((t) => ({ ...t, [flow.id]: e.target.value }))} maxLength={600} />}
                  </Field>
                </div>
                {flow.steps.map((step, stepIndex) => (
                  <StepEditor
                    key={step.id}
                    step={step}
                    index={stepIndex}
                    flow={flow}
                    flows={flows}
                    onChange={(next) => update(index, { steps: flow.steps.map((s, i) => (i === stepIndex ? next : s)) })}
                    onMove={(delta) => update(index, { steps: move(flow.steps, stepIndex, delta) })}
                    onRemove={() => update(index, { steps: flow.steps.filter((_, i) => i !== stepIndex) })}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={flow.steps.length >= 15}
                  onClick={() => update(index, { steps: [...flow.steps, { id: newId("step"), message: "", options: [] }] })}
                >
                  <Plus />
                  Add step
                </Button>
              </div>
            ) : null}
          </section>
        )
      })}
      <Button type="button" variant="outline" className="w-fit" disabled={flows.length >= 30} onClick={addFlow}>
        <Plus />
        Create flow
      </Button>
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t bg-background/95 py-3 backdrop-blur">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {pending ? "Saving…" : "Save flows"}
        </Button>
        <FormMessage state={state} className="flex-1" />
      </div>
    </div>
  )
}
