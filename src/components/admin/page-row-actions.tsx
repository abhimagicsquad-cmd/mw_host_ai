"use client"

import Link from "next/link"
import { useState } from "react"
import { Copy, ExternalLink, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePageAction, duplicatePageAction, setPageStatusAction } from "@/lib/admin/actions/pages"
import type { PageStatus } from "@/lib/cms/types"

import { ConfirmDialog, type ConfirmConfig } from "./form-controls"

type Props = {
  page: { id: string; title: string; path: string; status: PageStatus }
  canEdit: boolean
  canPublish: boolean
  canDelete: boolean
}

type Pending = "delete" | "status" | "duplicate"

export function PageRowActions({ page, canEdit, canPublish, canDelete }: Props) {
  const [pending, setPending] = useState<Pending | null>(null)
  const publishing = page.status !== "published"

  const dialogs: Record<Pending, ConfirmConfig> = {
    delete: {
      title: `Delete “${page.title}”?`,
      description: "The page, its sections and its SEO settings are removed permanently. Its URL falls back to the built-in page (if any) or a 404.",
      confirmLabel: "Delete page",
      destructive: true,
      action: () => deletePageAction(page.id),
    },
    status: {
      title: publishing ? `Publish “${page.title}”?` : `Unpublish “${page.title}”?`,
      description: publishing ? `It goes live at ${page.path} immediately.` : `${page.path} stops showing this content immediately.`,
      confirmLabel: publishing ? "Publish" : "Unpublish",
      action: () => setPageStatusAction(page.id, publishing ? "published" : "draft"),
    },
    duplicate: {
      title: `Duplicate “${page.title}”?`,
      description: "A draft copy with all its sections is created and opened for editing.",
      confirmLabel: "Duplicate",
      action: () => duplicatePageAction(page.id),
    },
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/pages/${page.id}`}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Edit ${page.title}`}
      >
        <Pencil className="size-4" />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`More actions for ${page.title}`} />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {page.status === "published" ? (
            <DropdownMenuItem render={<a href={page.path} target="_blank" rel="noopener noreferrer" />}>
              <ExternalLink />
              View live
            </DropdownMenuItem>
          ) : null}
          {canEdit ? (
            <DropdownMenuItem onClick={() => setPending("duplicate")}>
              <Copy />
              Duplicate
            </DropdownMenuItem>
          ) : null}
          {canPublish ? (
            <DropdownMenuItem onClick={() => setPending("status")}>
              {publishing ? <Eye /> : <EyeOff />}
              {publishing ? "Publish" : "Unpublish"}
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setPending("delete")}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {pending ? (
        <ConfirmDialog
          key={pending}
          open
          onOpenChange={(open) => {
            if (!open) setPending(null)
          }}
          {...dialogs[pending]}
        />
      ) : null}
    </div>
  )
}
