"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { CheckCircle2, FileUp, Loader2, UploadCloud, XCircle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { MediaFolder } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { selectClassName } from "./form-controls"
import { ACCEPTED_MEDIA, uploadMediaFile } from "./media-upload"
import { formatBytes } from "./ui"

type QueueItem = { key: string; file: File; progress: number; status: "queued" | "uploading" | "done" | "error"; error?: string }

export function MediaUploader() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [folder, setFolder] = useState<MediaFolder | "auto">("auto")
  const [queue, setQueue] = useState<QueueItem[]>([])
  const busy = queue.some((item) => item.status === "uploading" || item.status === "queued")

  function patch(key: string, next: Partial<QueueItem>) {
    setQueue((prev) => prev.map((item) => (item.key === key ? { ...item, ...next } : item)))
  }

  async function start(files: File[]) {
    if (!files.length) return
    const items: QueueItem[] = files.map((file) => ({ key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`, file, progress: 0, status: "queued" }))
    setQueue((prev) => [...items, ...prev])

    // Three at a time keeps the browser responsive on big batches.
    const pending = [...items]
    await Promise.all(
      Array.from({ length: Math.min(3, pending.length) }, async () => {
        for (let item = pending.shift(); item; item = pending.shift()) {
          const current = item
          patch(current.key, { status: "uploading" })
          const result = await uploadMediaFile(current.file, { folder, onProgress: (progress) => patch(current.key, { progress }) })
          patch(current.key, result.error ? { status: "error", error: result.error } : { status: "done", progress: 1 })
        }
      })
    )
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Save to folder
          <select className={cn(selectClassName, "w-52")} value={folder} onChange={(event) => setFolder(event.target.value as MediaFolder | "auto")}>
            <option value="auto">Automatic (by file type)</option>
            <option value="images">Images</option>
            <option value="icons">Icons</option>
            <option value="documents">Documents</option>
          </select>
        </label>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void start([...event.dataTransfer.files])
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card px-6 py-14 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Drag & drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, SVG, WEBP or PDF · up to 20 MB each</p>
        </div>
        <button type="button" className={buttonVariants()} onClick={() => inputRef.current?.click()}>
          <FileUp />
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_MEDIA}
          className="sr-only"
          aria-label="Choose files to upload"
          onChange={(event) => {
            void start([...(event.target.files ?? [])])
            event.target.value = ""
          }}
        />
      </div>

      {queue.length ? (
        <div className="rounded-xl border bg-card">
          <ul className="divide-y">
            {queue.map((item) => (
              <li key={item.key} className="flex items-center gap-3 px-4 py-3">
                {item.status === "done" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-label="Uploaded" />
                ) : item.status === "error" ? (
                  <XCircle className="size-5 shrink-0 text-destructive" aria-label="Failed" />
                ) : (
                  <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" aria-label="Uploading" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  {item.error ? (
                    <p className="text-xs text-destructive">{item.error}</p>
                  ) : (
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatBytes(item.file.size)}</span>
              </li>
            ))}
          </ul>
          {!busy ? (
            <div className="flex justify-end border-t px-4 py-3">
              <Link href="/admin/media/images" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Go to media library
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
