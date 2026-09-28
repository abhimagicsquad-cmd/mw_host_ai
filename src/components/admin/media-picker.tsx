"use client"

import { useState, useTransition } from "react"
import { FileText, ImagePlus, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { listMediaForPickerAction, type PickerMedia } from "@/lib/admin/actions/media"
import { cn } from "@/lib/utils"

/** URL input with a "choose from library" dialog. Used by image fields in the section editor, SEO and settings. */
export function MediaUrlInput({
  id,
  name,
  value,
  onChange,
  accept = "image",
}: {
  id?: string
  name?: string
  value: string
  onChange: (url: string) => void
  accept?: "image" | "any"
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PickerMedia[] | null>(null)
  const [error, setError] = useState<string>()
  const [query, setQuery] = useState("")
  const [loading, startLoading] = useTransition()

  function openPicker() {
    setOpen(true)
    if (items) return
    startLoading(async () => {
      const result = await listMediaForPickerAction()
      setItems(result.items)
      setError(result.error)
    })
  }

  const filtered = (items ?? [])
    .filter((item) => accept === "any" || item.mime_type.startsWith("image/"))
    .filter((item) => !query || item.file_name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex items-center gap-2">
      {value && /\.(png|jpe?g|webp|svg)(\?|$)/i.test(value) ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URLs; next/image would need every host allow-listed
        <img src={value} alt="" className="size-8 shrink-0 rounded border object-cover" />
      ) : null}
      <Input id={id} name={name} value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://… or /images/…" className="font-mono text-[13px]" />
      {value ? (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Clear" onClick={() => onChange("")}>
          <X />
        </Button>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={openPicker}>
        <ImagePlus />
        Library
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose from media library</DialogTitle>
            <DialogDescription>Upload new files under Media Library → Upload Media.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files…" className="pl-8" aria-label="Search media" />
          </div>
          <div className="max-h-[55vh] overflow-y-auto">
            {loading ? (
              <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </p>
            ) : error ? (
              <p className="py-12 text-center text-sm text-destructive">{error}</p>
            ) : filtered.length ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.public_url)
                      setOpen(false)
                    }}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-lg border text-left transition-colors hover:border-primary",
                      value === item.public_url && "border-primary ring-2 ring-primary/30"
                    )}
                  >
                    <span className="flex aspect-square items-center justify-center bg-muted/60">
                      {item.mime_type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element -- media library thumbnails from Supabase Storage
                        <img src={item.public_url} alt={item.alt_text ?? ""} className="size-full object-contain p-1.5" loading="lazy" />
                      ) : (
                        <FileText className="size-8 text-muted-foreground" />
                      )}
                    </span>
                    <span className="truncate px-2 py-1.5 text-xs">{item.file_name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No files found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
