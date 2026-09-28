"use client"

import { useRouter } from "next/navigation"
import { Copy, ExternalLink, Eye, EyeOff, MonitorSmartphone, Trash2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { deletePageAction, duplicatePageAction, setPageStatusAction } from "@/lib/admin/actions/pages"
import type { PageStatus } from "@/lib/cms/types"

import { ConfirmActionButton } from "./form-controls"

type Props = {
  page: { id: string; title: string; path: string; status: PageStatus }
  canEdit: boolean
  canPublish: boolean
  canDelete: boolean
}

/** Editor header actions: view, duplicate, delete, publish/unpublish. */
export function PageStatusControls({ page, canEdit, canPublish, canDelete }: Props) {
  const router = useRouter()
  const publishing = page.status !== "published"

  return (
    <>
      {/* Opens the real website template in draft preview (latest saved content, even unpublished). */}
      <a
        href={`/admin/preview?path=${encodeURIComponent(page.path)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "outline" })}
      >
        <MonitorSmartphone />
        Preview
      </a>
      {page.status === "published" ? (
        <a href={page.path} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
          <ExternalLink />
          View live
        </a>
      ) : null}
      {canEdit ? (
        <ConfirmActionButton
          variant="outline"
          title={`Duplicate “${page.title}”?`}
          description="A draft copy with all its sections is created and opened for editing."
          confirmLabel="Duplicate"
          action={() => duplicatePageAction(page.id)}
        >
          <Copy />
          Duplicate
        </ConfirmActionButton>
      ) : null}
      {canDelete ? (
        <ConfirmActionButton
          variant="destructive"
          destructive
          title={`Delete “${page.title}”?`}
          description="The page, its sections and its SEO settings are removed permanently."
          confirmLabel="Delete page"
          action={() => deletePageAction(page.id)}
          onDone={() => router.push("/admin/pages")}
        >
          <Trash2 />
          Delete
        </ConfirmActionButton>
      ) : null}
      {canPublish ? (
        <ConfirmActionButton
          variant={publishing ? "default" : "outline"}
          title={publishing ? "Publish this page?" : "Unpublish this page?"}
          description={publishing ? `It goes live at ${page.path} immediately.` : `${page.path} stops showing this content immediately.`}
          confirmLabel={publishing ? "Publish now" : "Unpublish"}
          action={() => setPageStatusAction(page.id, publishing ? "published" : "draft")}
        >
          {publishing ? <Eye /> : <EyeOff />}
          {publishing ? "Publish" : "Unpublish"}
        </ConfirmActionButton>
      ) : null}
    </>
  )
}
