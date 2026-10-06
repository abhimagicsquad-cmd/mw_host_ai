"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { serviceOptions } from "@/constants/service-options"
import { saveAssistantSectionAction } from "@/lib/admin/actions/assistant"
import { PLAN_CATEGORIES, QUICK_ACTION_KINDS, type AssistantSettings, type ConversationFlow, type ConversationStarter, type FlowStep, type PlanCategory, type QuickAction, type QuickActionKind } from "@/lib/assistant/types"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { move } from "../field-renderer"
import { Field, FormMessage, selectClassName } from "../form-controls"
import { MediaUrlInput } from "../media-picker"
import { Panel } from "../ui"

type Section = Parameters<typeof saveAssistantSectionAction>[0]

/** Short random id for new list items (letters, digits and dashes, as the parser requires). */
const newItemId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

function useSectionSave(section: Section) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<ActionState>()
  const save = (payload: unknown) =>
    startTransition(async () => {
      const result = await saveAssistantSectionAction(section, JSON.stringify(payload))
      setState(result)
      if (!result.error) router.refresh()
    })
  return { pending, state, save }
}

function SaveBar({ pending, state, onSave, label = "Save" }: { pending: boolean; state?: ActionState; onSave: () => void; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t pt-4">
      <Button type="button" onClick={onSave} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />}
        {pending ? "Saving…" : label}
      </Button>
      <FormMessage state={state} className="flex-1" />
    </div>
  )
}

function RowControls({ index, length, onMove, onRemove, label }: { index: number; length: number; onMove: (delta: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center">
      <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${label} down`} disabled={index === length - 1} onClick={() => onMove(1)}>
        <ArrowDown />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" aria-label={`Delete ${label}`} onClick={onRemove}>
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  )
}

// --- General settings ----------------------------------------------------------------------

type General = Pick<
  AssistantSettings,
  "brandName" | "welcomeMessage" | "introMessage" | "avatarUrl" | "position" | "primaryColor" | "secondaryColor" | "typingDelayMs" | "autoOpenSeconds" | "visibility" | "pages"
>

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label} help="Text on this colour switches between white and dark automatically for contrast.">
      {(id) => (
        <div className="flex items-center gap-2">
          <input type="color" aria-label={`${label} picker`} value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5" />
          <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} className="w-28 font-mono uppercase" />
        </div>
      )}
    </Field>
  )
}

export function AssistantGeneralForm({ initial }: { initial: General }) {
  const [values, setValues] = useState(initial)
  const [pagesText, setPagesText] = useState(initial.pages.join("\n"))
  const { pending, state, save } = useSectionSave("general")
  const set = <K extends keyof General>(key: K, value: General[K]) => setValues((v) => ({ ...v, [key]: value }))

  return (
    <Panel title="Settings" description="Appearance and behaviour of the website chat. The ON/OFF switch above controls whether it shows at all.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Brand name" required>
          {(id) => <Input id={id} value={values.brandName} maxLength={60} onChange={(e) => set("brandName", e.target.value)} />}
        </Field>
        <Field label="Avatar image" help="Square image; leave empty for the default icon.">
          {(id) => <MediaUrlInput id={id} value={values.avatarUrl} onChange={(url) => set("avatarUrl", url)} />}
        </Field>
        <Field label="Welcome message" className="sm:col-span-2" required help="The first message visitors see.">
          {(id) => <Textarea id={id} rows={6} maxLength={1000} value={values.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} />}
        </Field>
        <Field label="Intro message" className="sm:col-span-2" help="Short line under the welcome message, above the conversation starters.">
          {(id) => <Input id={id} maxLength={300} value={values.introMessage} onChange={(e) => set("introMessage", e.target.value)} />}
        </Field>
        <ColorField label="Primary colour" value={values.primaryColor} onChange={(v) => set("primaryColor", v)} />
        <ColorField label="Secondary colour" value={values.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
        <Field label="Widget position">
          {(id) => (
            <select id={id} className={selectClassName} value={values.position} onChange={(e) => set("position", e.target.value === "bottom-left" ? "bottom-left" : "bottom-right")}>
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
            </select>
          )}
        </Field>
        <Field label="Typing delay (ms)" help="How long the typing indicator shows before each reply (0–3000).">
          {(id) => <Input id={id} type="number" min={0} max={3000} step={100} value={values.typingDelayMs} onChange={(e) => set("typingDelayMs", Number(e.target.value))} />}
        </Field>
        <Field label="Auto open delay (seconds)" help="Opens the chat by itself once per visit after this many seconds. 0 = never.">
          {(id) => <Input id={id} type="number" min={0} max={600} value={values.autoOpenSeconds} onChange={(e) => set("autoOpenSeconds", Number(e.target.value))} />}
        </Field>
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="text-sm font-medium">Where to show it</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="assistant-visibility" checked={values.visibility === "all"} onChange={() => set("visibility", "all")} />
            Show on all pages
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="assistant-visibility" checked={values.visibility === "selected"} onChange={() => set("visibility", "selected")} />
            Show on selected pages only
          </label>
          {values.visibility === "selected" ? (
            <Field label="Pages" help="One path per line, e.g. /vps-hosting/ — end with * for a whole section, e.g. /hosting/*">
              {(id) => <Textarea id={id} rows={4} value={pagesText} onChange={(e) => setPagesText(e.target.value)} className="font-mono text-xs" />}
            </Field>
          ) : null}
        </fieldset>
      </div>
      <div className="mt-5">
        <SaveBar
          pending={pending}
          state={state}
          label="Save settings"
          onSave={() => save({ ...values, pages: pagesText.split("\n").map((line) => line.trim()).filter(Boolean) })}
        />
      </div>
    </Panel>
  )
}

// --- Quick actions -------------------------------------------------------------------------

function ActionValueInput({ action, flows, onChange }: { action: QuickAction; flows: ConversationFlow[]; onChange: (value: string) => void }) {
  if (action.kind === "recommend") return <p className="text-xs text-muted-foreground">Runs the recommendation flow below.</p>
  if (action.kind === "flow") {
    return (
      <select aria-label="Conversation flow" className={selectClassName} value={action.value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a flow…</option>
        {flows.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    )
  }
  if (action.kind === "plans") {
    return (
      <select aria-label="Plan category" className={selectClassName} value={action.value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a category…</option>
        {PLAN_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    )
  }
  if (action.kind === "lead") {
    return (
      <select aria-label="Service for the enquiry form" className={selectClassName} value={action.value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a service…</option>
        {serviceOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <Input
      aria-label={action.kind === "link" ? "URL" : "Question to search for"}
      value={action.value ?? ""}
      maxLength={300}
      placeholder={action.kind === "link" ? "/contact-us/ or https://…" : "e.g. SSL certificate"}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function QuickActionsEditor({ initial, flows }: { initial: QuickAction[]; flows: ConversationFlow[] }) {
  const [items, setItems] = useState(initial)
  const { pending, state, save } = useSectionSave("quickActions")
  const update = (index: number, patch: Partial<QuickAction>) => setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <Panel title="Quick actions" description="Buttons along the bottom of the chat. Each should start a conversation — usually a conversation flow. Up to 20.">
      <div className="flex flex-col gap-2">
        {items.map((action, index) => (
          <div key={action.id} className="grid gap-2 rounded-lg border bg-background p-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_auto] sm:items-center">
            <Input aria-label="Button label" value={action.label} maxLength={40} placeholder="Button label" onChange={(e) => update(index, { label: e.target.value })} />
            <select
              aria-label="What it does"
              className={selectClassName}
              value={action.kind}
              onChange={(e) => update(index, { kind: e.target.value as QuickActionKind, value: undefined })}
            >
              {QUICK_ACTION_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            <ActionValueInput action={action} flows={flows} onChange={(value) => update(index, { value })} />
            <RowControls
              index={index}
              length={items.length}
              label={action.label || "action"}
              onMove={(delta) => setItems((list) => move(list, index, delta))}
              onRemove={() => setItems((list) => list.filter((_, i) => i !== index))}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={items.length >= 20}
          onClick={() => setItems((list) => [...list, { id: newItemId("qa"), label: "", kind: "ask", value: "" }])}
        >
          <Plus />
          Add quick action
        </Button>
      </div>
      <div className="mt-4">
        <SaveBar pending={pending} state={state} label="Save quick actions" onSave={() => save({ quickActions: items })} />
      </div>
    </Panel>
  )
}

// --- Conversation starters -----------------------------------------------------------------

export function StartersEditor({ initial, actions, flows }: { initial: ConversationStarter[]; actions: QuickAction[]; flows: ConversationFlow[] }) {
  const [items, setItems] = useState(initial)
  const { pending, state, save } = useSectionSave("starters")
  const update = (index: number, patch: Partial<ConversationStarter>) => setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <Panel title="Conversation starters" description="Suggested opening lines under the welcome message. Each can start a conversation flow, run a quick action, or be answered like a typed question.">
      <div className="flex flex-col gap-2">
        {items.map((starter, index) => (
          <div key={starter.id} className="grid gap-2 rounded-lg border bg-background p-2.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
            <Input aria-label="Starter text" value={starter.text} maxLength={80} placeholder="e.g. Looking for Hosting?" onChange={(e) => update(index, { text: e.target.value })} />
            <select
              aria-label="When clicked"
              className={selectClassName}
              value={starter.flowId ? `flow:${starter.flowId}` : starter.actionId ? `action:${starter.actionId}` : ""}
              onChange={(e) => {
                const [kind, id] = e.target.value.split(":")
                update(index, { flowId: kind === "flow" ? id : undefined, actionId: kind === "action" ? id : undefined })
              }}
            >
              <option value="">Answer as a question</option>
              <optgroup label="Start a conversation flow">
                {flows.map((f) => (
                  <option key={f.id} value={`flow:${f.id}`}>
                    Flow: {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Run a quick action">
                {actions.map((action) => (
                  <option key={action.id} value={`action:${action.id}`}>
                    Run: {action.label}
                  </option>
                ))}
              </optgroup>
            </select>
            <RowControls
              index={index}
              length={items.length}
              label={starter.text || "starter"}
              onMove={(delta) => setItems((list) => move(list, index, delta))}
              onRemove={() => setItems((list) => list.filter((_, i) => i !== index))}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="w-fit" disabled={items.length >= 10} onClick={() => setItems((list) => [...list, { id: newItemId("st"), text: "" }])}>
          <Plus />
          Add starter
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Starters use the saved quick actions — save new quick actions first.</p>
      <div className="mt-4">
        <SaveBar pending={pending} state={state} label="Save starters" onSave={() => save({ starters: items })} />
      </div>
    </Panel>
  )
}

// --- Recommendation flow -------------------------------------------------------------------

export function FlowEditor({ initial, fallbackCategory }: { initial: FlowStep[]; fallbackCategory: PlanCategory }) {
  const [steps, setSteps] = useState(initial)
  const [fallback, setFallback] = useState<PlanCategory>(fallbackCategory)
  const { pending, state, save } = useSectionSave("flow")
  const updateStep = (index: number, patch: Partial<FlowStep>) => setSteps((list) => list.map((step, i) => (i === index ? { ...step, ...patch } : step)))
  const updateOption = (stepIndex: number, optionIndex: number, patch: Record<string, unknown>) =>
    updateStep(stepIndex, { options: steps[stepIndex].options.map((option, i) => (i === optionIndex ? { ...option, ...patch } : option)) })

  return (
    <Panel
      title="Hosting plan recommendation"
      description="Questions asked one by one when a visitor wants a recommendation. Each answer can point at a plan category and a size; the largest category and size win, and the plan is picked from Hosting Plans (by display order) in that category."
    >
      <div className="flex flex-col gap-4">
        {steps.map((step, stepIndex) => (
          <div key={step.id} className="rounded-lg border bg-background p-3">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{stepIndex + 1}</span>
              <Input aria-label={`Question ${stepIndex + 1}`} value={step.question} maxLength={200} placeholder="Question" onChange={(e) => updateStep(stepIndex, { question: e.target.value })} className="font-medium" />
              <RowControls
                index={stepIndex}
                length={steps.length}
                label={`question ${stepIndex + 1}`}
                onMove={(delta) => setSteps((list) => move(list, stepIndex, delta))}
                onRemove={() => setSteps((list) => list.filter((_, i) => i !== stepIndex))}
              />
            </div>
            <div className="mt-3 flex flex-col gap-2 pl-8">
              {step.options.map((option, optionIndex) => (
                <div key={option.id} className="grid gap-2 rounded-md bg-muted/40 p-2 lg:grid-cols-[minmax(0,1fr)_10rem_7rem_minmax(0,1.4fr)_auto] lg:items-center">
                  <Input aria-label="Answer" value={option.label} maxLength={60} placeholder="Answer" onChange={(e) => updateOption(stepIndex, optionIndex, { label: e.target.value })} />
                  <select
                    aria-label="Plan category"
                    className={selectClassName}
                    value={option.category ?? ""}
                    onChange={(e) => updateOption(stepIndex, optionIndex, { category: e.target.value || undefined })}
                  >
                    <option value="">No category</option>
                    {PLAN_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Plan size"
                    className={selectClassName}
                    value={option.size ?? ""}
                    onChange={(e) => updateOption(stepIndex, optionIndex, { size: e.target.value ? Number(e.target.value) : undefined })}
                  >
                    <option value="">No size</option>
                    <option value="1">1 · entry</option>
                    <option value="2">2 · mid</option>
                    <option value="3">3 · top</option>
                  </select>
                  <Input aria-label="Note shown with the recommendation" value={option.note ?? ""} maxLength={300} placeholder="Note (optional)" onChange={(e) => updateOption(stepIndex, optionIndex, { note: e.target.value || undefined })} />
                  <RowControls
                    index={optionIndex}
                    length={step.options.length}
                    label={option.label || "answer"}
                    onMove={(delta) => updateStep(stepIndex, { options: move(step.options, optionIndex, delta) })}
                    onRemove={() => updateStep(stepIndex, { options: step.options.filter((_, i) => i !== optionIndex) })}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                disabled={step.options.length >= 8}
                onClick={() => updateStep(stepIndex, { options: [...step.options, { id: newItemId("op"), label: "" }] })}
              >
                <Plus />
                Add answer
              </Button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-4">
          <Button type="button" variant="outline" size="sm" disabled={steps.length >= 10} onClick={() => setSteps((list) => [...list, { id: newItemId("q"), question: "", options: [{ id: newItemId("op"), label: "" }] }])}>
            <Plus />
            Add question
          </Button>
          <Field label="If no answer names a category" className="w-56">
            {(id) => (
              <select id={id} className={cn(selectClassName)} value={fallback} onChange={(e) => setFallback(e.target.value as PlanCategory)}>
                {PLAN_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </div>
      <div className="mt-4">
        <SaveBar pending={pending} state={state} label="Save flow" onSave={() => save({ steps, fallbackCategory: fallback })} />
      </div>
    </Panel>
  )
}
