"use client"

import { useRouter } from "next/navigation"
import { useActionState, useMemo, useRef, useState, useTransition } from "react"
import { Check, Copy, FileText, Loader2, RefreshCw, Save, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { deleteMediaAction, updateMediaAction } from "@/lib/admin/actions/media"
import type { ActionState, MediaRow } from "@/lib/cms/types"

import { ConfirmActionButton, Field, FormMessage, selectClassName, SubmitButton } from "./form-controls"
import { ACCEPTED_MEDIA, uploadMediaFile } from "./media-upload"
import { formatBytes, formatDate } from "./ui"

const TYPE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WEBP" },
  { value: "image/svg+xml", label: "SVG" },
  { value: "application/pdf", label: "PDF" },
]

export function MediaLibrary({ items, canManage }: { items: MediaRow[]; canManage: boolean }) {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")
  const [sort, setSort] = useState<"newest" | "oldest" | "name" | "size">("newest")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = items.filter(
      (item) => (type === "all" || item.mime_type === type) && (!q || item.file_name.toLowerCase().includes(q) || item.alt_text?.toLowerCase().includes(q))
    )
    return list.sort((a, b) =>
      sort === "name"
        ? a.file_name.localeCompare(b.file_name)
        : sort === "size"
          ? b.size_bytes - a.size_bytes
          : sort === "oldest"
            ? a.created_at.localeCompare(b.created_at)
            : b.created_at.localeCompare(a.created_at)
    )
  }, [items, query, type, sort])

  const selected = items.find((item) => item.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or alt text…" className="pl-8" aria-label="Search media" />
        </div>
        <select aria-label="Filter by type" className={`${selectClassName} w-36`} value={type} onChange={(event) => setType(event.target.value)}>
          {TYPE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
        <select aria-label="Sort" className={`${selectClassName} w-36`} value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="size">Largest first</option>
        </select>
        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {items.length}
        </span>
      </div>

      {filtered.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="group flex w-full flex-col overflow-hidden rounded-xl border bg-card text-left shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                <span className="flex aspect-square items-center justify-center bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
                  {item.mime_type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage thumbnails; the originals are already web-sized
                    <img src={item.public_url} alt={item.alt_text ?? ""} loading="lazy" className="size-full object-contain p-2" />
                  ) : (
                    <FileText className="size-10 text-muted-foreground" aria-hidden />
                  )}
                </span>
                <span className="border-t px-2.5 py-2">
                  <span className="block truncate text-xs font-medium">{item.file_name}</span>
                  <span className="block text-[11px] text-muted-foreground">{formatBytes(item.size_bytes)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed bg-card py-14 text-center text-sm text-muted-foreground">
          {items.length ? "No files match your filters." : "No files in this folder yet."}
        </p>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        {selected ? (
          <DialogContent className="sm:max-w-3xl">
            <MediaDetails key={selected.id + selected.updated_at} item={selected} canManage={canManage} onDeleted={() => setSelectedId(null)} />
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}

function MediaDetails({ item, canManage, onDeleted }: { item: MediaRow; canManage: boolean; onDeleted: () => void }) {
  const router = useRouter()
  const [state, formAction] = useActionState(updateMediaAction.bind(null, item.id), {})
  const [copied, setCopied] = useState(false)
  const [replaceState, setReplaceState] = useState<ActionState>()
  const [replacing, startReplace] = useTransition()
  const replaceRef = useRef<HTMLInputElement>(null)
  const isImage = item.mime_type.startsWith("image/")

  return (
    <>
      <DialogHeader>
        <DialogTitle className="truncate pr-8">{item.file_name}</DialogTitle>
        <DialogDescription>
          {item.mime_type} · {formatBytes(item.size_bytes)} · uploaded {formatDate(item.created_at)}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-lg border bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- full-size preview of a Supabase Storage object
            <img src={item.public_url} alt={item.alt_text ?? ""} className="max-h-[50vh] max-w-full object-contain" />
          ) : (
            <a href={item.public_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-sm text-primary hover:underline">
              <FileText className="size-12" aria-hidden />
              Open document
            </a>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input readOnly value={item.public_url} aria-label="File URL" className="font-mono text-xs" onFocus={(event) => event.target.select()} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy URL"
              onClick={async () => {
                await navigator.clipboard.writeText(item.public_url)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
          <form action={formAction} className="flex flex-col gap-3">
            <fieldset disabled={!canManage} className="contents">
              <Field label="File name">{(id) => <Input id={id} name="file_name" defaultValue={item.file_name} required maxLength={255} />}</Field>
              <Field label="Alt text" help="Describes the image for screen readers and SEO.">
                {(id) => <Input id={id} name="alt_text" defaultValue={item.alt_text ?? ""} maxLength={500} />}
              </Field>
              <Field label="Folder">
                {(id) => (
                  <select id={id} name="folder" defaultValue={item.folder} className={selectClassName}>
                    <option value="images">Images</option>
                    <option value="icons">Icons</option>
                    <option value="documents">Documents</option>
                  </select>
                )}
              </Field>
              {canManage ? (
                <SubmitButton size="sm" className="self-start">
                  <Save />
                  Save details
                </SubmitButton>
              ) : null}
            </fieldset>
            <FormMessage state={state} />
          </form>
          {canManage ? (
            <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="sm" disabled={replacing} onClick={() => replaceRef.current?.click()}>
                {replacing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                Replace file
              </Button>
              <input
                ref={replaceRef}
                type="file"
                accept={ACCEPTED_MEDIA}
                className="sr-only"
                aria-label="Choose replacement file"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (!file) return
                  startReplace(async () => {
                    const result = await uploadMediaFile(file, { replaceId: item.id })
                    setReplaceState(result.error ? result : { ok: true, message: "File replaced. Pages using it show the new version." })
                    if (!result.error) router.refresh()
                  })
                }}
              />
              <ConfirmActionButton
                variant="destructive"
                size="sm"
                destructive
                title="Delete this file?"
                description="It's removed from storage permanently. Any page still using its URL will show a broken image."
                confirmLabel="Delete file"
                action={() => deleteMediaAction(item.id)}
                onDone={onDeleted}
              >
                <Trash2 />
                Delete
              </ConfirmActionButton>
              <FormMessage state={replaceState} className="w-full" />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
