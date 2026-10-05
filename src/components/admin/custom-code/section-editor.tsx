"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { Eye, GitCompare, History, Loader2, Power, PowerOff, RotateCcw, Save, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  previewCustomCodeAction,
  resetCustomCodeAction,
  restoreCustomCodeVersionAction,
  saveCustomCodeAction,
  setCustomCodeEnabledAction,
} from "@/lib/admin/actions/custom-code"
import type { ActionState } from "@/lib/cms/types"
import type { CodeSectionState, HistoryEntry, SectionId, SectionMeta, SectionState, TrackingState, VerificationState } from "@/lib/custom-code/types"
import { buildTrackingOutput, lineDiff, parseOtherVerification, stateToText, TRACKING_FIELDS, VERIFICATION_FIELDS, extractVerificationCode } from "@/lib/custom-code/validate"
import { cn } from "@/lib/utils"

import { CodeEditor, MONO } from "../code-editor"
import { ConfirmActionButton, Field, FormMessage } from "../form-controls"
import { formatDate, Panel } from "../ui"

const isCode = (state: SectionState): state is CodeSectionState => "code" in state

/** What the website will output for the structured sections (shown read-only). */
function generatedOutput(section: SectionId, state: SectionState, googleAdsId: string) {
  if (section === "tracking") {
    const t = state as TrackingState
    if (!t.enabled) return "<!-- Tracking Scripts are disabled: nothing is output. -->"
    const lines: string[] = []
    const gtag = [googleAdsId, t.ga4Id].filter(Boolean)
    if (gtag.length) {
      lines.push(`<!-- Google tag (gtag.js), shared by ${t.ga4Id ? "Google Ads and GA4" : "Google Ads"} -->`, `<script async src="https://www.googletagmanager.com/gtag/js?id=${gtag[0]}"></script>`)
      lines.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${gtag.map((id) => `gtag('config','${id}');`).join("")}</script>`)
    }
    if (t.clarityId) lines.push("<!-- Microsoft Clarity -->", `<script>(function(c,l,a,r,i,t,y){…})(window,document,"clarity","script","${t.clarityId}");</script>`)
    const generated = buildTrackingOutput(t)
    for (const script of generated.scripts) lines.push(`<!-- ${script.id} -->`, `<script>${script.code}</script>`)
    if (generated.noscript) lines.push("<!-- After <body> -->", generated.noscript)
    return lines.join("\n") || "<!-- No tracking IDs set: nothing is output. -->"
  }
  const v = state as VerificationState
  if (!v.enabled) return "<!-- Verification Codes are disabled: nothing is output. -->"
  const tags = VERIFICATION_FIELDS.filter((f) => v[f.key]).map((f) => `<meta name="${f.metaName}" content="${extractVerificationCode(v[f.key])}">`)
  for (const tag of parseOtherVerification(v.other).tags) tags.push(`<meta name="${tag.name}" content="${tag.content}">`)
  return tags.join("\n") || "<!-- No verification codes set: nothing is output. -->"
}

function DiffView({ before, after }: { before: string; after: string }) {
  const lines = useMemo(() => lineDiff(before, after), [before, after])
  const changed = lines.some((line) => line.type !== "same")
  return (
    <pre className={cn("max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-0 text-[12px] leading-[1.6]", MONO)}>
      {changed ? (
        lines.map((line, index) => (
          <div
            key={index}
            className={cn(
              "px-3 whitespace-pre",
              line.type === "added" && "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
              line.type === "removed" && "bg-destructive/10 text-destructive line-through decoration-destructive/40"
            )}
          >
            <span className="mr-2 inline-block w-3 text-muted-foreground select-none">{line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}</span>
            {line.text || " "}
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-muted-foreground">No differences — this version matches the live one.</div>
      )}
    </pre>
  )
}

function HistoryPanel({ section, label, history, live }: { section: SectionId; label: string; history: HistoryEntry[]; live: SectionState }) {
  const [comparing, setComparing] = useState<HistoryEntry | null>(null)
  return (
    <Panel title="Version history" description={`The last ${history.length ? `${history.length} ` : ""}saved versions (up to 20). Restoring makes a version live again and is itself recorded.`}>
      {history.length ? (
        <ol className="flex flex-col divide-y">
          {history.map((entry, index) => (
            <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
              <History className="size-4 text-muted-foreground" aria-hidden />
              <span className="font-medium">{formatDate(entry.savedAt)}</span>
              <span className="text-muted-foreground">
                {entry.note}
                {entry.savedBy ? ` · ${entry.savedBy}` : ""}
              </span>
              {index === 0 ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Live</span> : null}
              <div className="ml-auto flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setComparing(entry)}>
                  <GitCompare />
                  Compare
                </Button>
                {index > 0 ? (
                  <ConfirmActionButton
                    variant="ghost"
                    size="sm"
                    action={() => restoreCustomCodeVersionAction(section, entry.id)}
                    title={`Restore this version of ${label}?`}
                    description={`The version saved ${formatDate(entry.savedAt)} becomes live on the website immediately. The current version stays in the history.`}
                    confirmLabel="Restore version"
                  >
                    <Undo2 />
                    Restore
                  </ConfirmActionButton>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No saved versions yet. Every save, reset, enable/disable and restore is recorded here.</p>
      )}
      {comparing ? (
        <Dialog open onOpenChange={(open) => !open && setComparing(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Compare with the live version</DialogTitle>
              <DialogDescription>
                Version from {formatDate(comparing.savedAt)} ({comparing.note}) → live. <span className="text-destructive">Removed</span> lines are only in the older version;{" "}
                <span className="text-emerald-700 dark:text-emerald-400">added</span> lines are only live.
              </DialogDescription>
            </DialogHeader>
            <DiffView before={stateToText(comparing.state)} after={stateToText(live)} />
          </DialogContent>
        </Dialog>
      ) : null}
    </Panel>
  )
}

/** Admin → Custom Code Manager → one section. */
export function CustomCodeSectionEditor({
  section,
  meta,
  initial,
  hasDraft,
  history,
  googleAdsId,
}: {
  section: SectionId
  meta: SectionMeta
  initial: SectionState
  hasDraft: boolean
  history: HistoryEntry[]
  googleAdsId: string
}) {
  const router = useRouter()
  const [state, setState] = useState<SectionState>(initial)
  const [result, setResult] = useState<ActionState>()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<"save" | "preview" | "toggle" | null>(null)
  const [lastInitial, setLastInitial] = useState(initial)
  if (initial !== lastInitial) {
    // Fresh data from the server after a save/restore: show it.
    setLastInitial(initial)
    setState(initial)
  }

  const dirty = JSON.stringify(state) !== JSON.stringify(initial)

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const run = (kind: "save" | "toggle", action: () => Promise<ActionState>) =>
    startTransition(async () => {
      setBusy(kind)
      const r = await action()
      setResult(r)
      setBusy(null)
      if (!r.error) router.refresh()
    })

  function save() {
    run("save", () => saveCustomCodeAction(section, JSON.stringify(state)))
  }

  function preview() {
    // Open the tab in the click (popup blockers only allow that), then point it at the website.
    const tab = window.open("about:blank", "_blank")
    startTransition(async () => {
      setBusy("preview")
      const r = await previewCustomCodeAction(section, JSON.stringify(state))
      setResult(r)
      setBusy(null)
      if (r.error) tab?.close()
      else if (tab) tab.location.href = "/admin/preview?path=/"
      else window.open("/admin/preview?path=/", "_blank")
    })
  }

  function toggle(enabled: boolean) {
    run("toggle", () => setCustomCodeEnabledAction(section, enabled))
  }

  const liveEnabled = initial.enabled
  const set = (patch: Partial<SectionState>) => setState((s) => ({ ...s, ...patch }) as SectionState)

  return (
    <div className="flex flex-col gap-6">
      <section className={cn("flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between", liveEnabled ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/10" : "bg-muted/40")}>
        <div>
          <h2 className="text-sm font-semibold">{meta.label} status</h2>
          <p className="text-sm text-muted-foreground">
            {liveEnabled ? "Enabled — the saved version is output on every website page." : "Disabled — nothing from this section is output on the website."}
          </p>
        </div>
        <div className="inline-flex rounded-lg border bg-background p-0.5" role="group" aria-label={`${meta.label} status`}>
          {[true, false].map((on) => (
            <button
              key={String(on)}
              type="button"
              aria-pressed={liveEnabled === on}
              disabled={pending || liveEnabled === on}
              onClick={() => toggle(on)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-default",
                liveEnabled === on ? (on ? "bg-emerald-600 text-white" : "bg-foreground text-background") : "text-muted-foreground hover:bg-muted"
              )}
            >
              {busy === "toggle" && liveEnabled !== on ? <Loader2 className="size-4 animate-spin" /> : on ? <Power className="size-4" /> : <PowerOff className="size-4" />}
              {on ? "Enabled" : "Disabled"}
            </button>
          ))}
        </div>
      </section>

      <Panel title={meta.label} description={meta.description}>
        {isCode(state) ? (
          <CodeEditor
            id={`code-${section}`}
            label={`${meta.label} editor`}
            language={meta.language === "fields" ? "html" : meta.language}
            value={state.code}
            placeholder={meta.placeholder}
            onChange={(code) => set({ code })}
            minHeight={section === "css" || section === "js" ? 520 : 380}
          />
        ) : section === "tracking" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {TRACKING_FIELDS.map((field) => (
              <Field key={field.key} label={field.label} help={`${field.help} Example: ${field.example}. Leave empty to turn it off.`}>
                {(id) => (
                  <Input
                    id={id}
                    value={(state as TrackingState)[field.key]}
                    onChange={(e) => set({ [field.key]: e.target.value.trim() } as Partial<TrackingState>)}
                    placeholder={field.example}
                    className={cn("", MONO)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                )}
              </Field>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {VERIFICATION_FIELDS.map((field) => (
              <Field key={field.key} label={field.label} help={`Adds <meta name="${field.metaName}">. Paste the code or the whole tag.`}>
                {(id) => (
                  <Input
                    id={id}
                    value={(state as VerificationState)[field.key]}
                    onChange={(e) => set({ [field.key]: e.target.value } as Partial<VerificationState>)}
                    placeholder={field.example}
                    className={cn("", MONO)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                )}
              </Field>
            ))}
            <Field label="Other verification codes" className="sm:col-span-2" help='One <meta name="…" content="…"> tag per line (e.g. Yandex, Norton Safe Web).'>
              {(id) => (
                <Textarea
                  id={id}
                  rows={4}
                  value={(state as VerificationState).other}
                  onChange={(e) => set({ other: e.target.value } as Partial<VerificationState>)}
                  className={cn("text-xs", MONO)}
                  spellCheck={false}
                  placeholder='<meta name="yandex-verification" content="…">'
                />
              )}
            </Field>
          </div>
        )}

        {!isCode(state) ? (
          <div className="mt-5">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Generated output {dirty ? "(unsaved changes)" : ""}</p>
            <pre className={cn("max-h-72 overflow-auto rounded-md border bg-muted/30 p-3 text-[12px] leading-[1.6] whitespace-pre-wrap break-all", MONO)}>{generatedOutput(section, state, googleAdsId)}</pre>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
          <Button type="button" onClick={save} disabled={pending || !dirty}>
            {busy === "save" ? <Loader2 className="animate-spin" /> : <Save />}
            {busy === "save" ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={preview} disabled={pending}>
            {busy === "preview" ? <Loader2 className="animate-spin" /> : <Eye />}
            Preview on website
          </Button>
          {dirty ? (
            <Button type="button" variant="ghost" onClick={() => setState(initial)} disabled={pending}>
              <Undo2 />
              Discard changes
            </Button>
          ) : null}
          <ConfirmActionButton
            variant="ghost"
            className="ml-auto text-destructive"
            action={() => resetCustomCodeAction(section)}
            title={`Reset ${meta.label}?`}
            description={
              section === "tracking"
                ? "Tracking goes back to the site's built-in IDs (Microsoft Clarity) and every other tracker is cleared, immediately. The current version stays in the history."
                : "The section is cleared and goes live immediately. The current version stays in the history, so you can restore it."
            }
            confirmLabel="Reset section"
            destructive
          >
            <RotateCcw />
            Reset
          </ConfirmActionButton>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <FormMessage state={result} />
          {dirty ? <p className="text-xs text-amber-700 dark:text-amber-400">You have unsaved changes. The status switch and the website use the saved version.</p> : null}
          {hasDraft ? <p className="text-xs text-muted-foreground">A preview draft exists — only you see it, in preview mode. Saving publishes your current editor content.</p> : null}
          <p className="text-xs text-muted-foreground">
            Preview opens the website in preview mode with your unsaved code (only for you). Use “Exit preview” on the website to leave.
          </p>
        </div>
      </Panel>

      <HistoryPanel section={section} label={meta.label} history={history} live={initial} />
    </div>
  )
}
