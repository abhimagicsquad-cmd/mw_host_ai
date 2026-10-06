"use client"

import { Eye, EyeOff, Trash2 } from "lucide-react"

import { bulkDeletePagesAction, bulkSetPageStatusAction } from "@/lib/admin/actions/pages"

import { BulkActionBar, BulkConfirmButton } from "./bulk-selection"

const pages = (count: number) => `${count} ${count === 1 ? "page" : "pages"}`

export function PagesBulkActions({ canPublish, canDelete }: { canPublish: boolean; canDelete: boolean }) {
  return (
    <BulkActionBar noun={["page", "pages"]}>
      {canPublish ? (
        <>
          <BulkConfirmButton
            run={(ids) => bulkSetPageStatusAction(ids, "published")}
            title={(count) => `Publish ${pages(count)}?`}
            description={() => "Selected drafts go live at their URLs immediately. Pages that are already live stay as they are."}
            confirmLabel="Publish"
          >
            <Eye />
            Publish
          </BulkConfirmButton>
          <BulkConfirmButton
            run={(ids) => bulkSetPageStatusAction(ids, "draft")}
            title={(count) => `Unpublish ${pages(count)}?`}
            description={() => "Selected pages move to drafts and stop showing this content immediately. Their URLs fall back to the built-in page (if any) or a 404."}
            confirmLabel="Unpublish"
          >
            <EyeOff />
            Unpublish
          </BulkConfirmButton>
        </>
      ) : null}
      {canDelete ? (
        <BulkConfirmButton
          run={bulkDeletePagesAction}
          title={(count) => `Delete ${pages(count)}?`}
          description={(count) =>
            `${count === 1 ? "The page, its sections and its SEO settings are" : "These pages, their sections and their SEO settings are"} removed permanently. This can't be undone.`
          }
          confirmLabel="Delete permanently"
          destructive
        >
          <Trash2 />
          Delete
        </BulkConfirmButton>
      ) : null}
    </BulkActionBar>
  )
}
