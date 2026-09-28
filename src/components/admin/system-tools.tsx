"use client"

import { useActionState, useState } from "react"
import { DownloadCloud, RefreshCw } from "lucide-react"

import { clearWebsiteCacheAction, importFromSanityAction } from "@/lib/admin/actions/settings"
import type { ActionState } from "@/lib/cms/types"

import { ActionButton, checkboxClassName, FormMessage, SubmitButton } from "./form-controls"
import { Panel } from "./ui"

export function SystemTools() {
  const [importState, importAction] = useActionState(importFromSanityAction, {})
  const [cacheState, setCacheState] = useState<ActionState>()

  return (
    <Panel title="Migration & maintenance" description="One-time Sanity import and cache controls">
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={importAction} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Copies the Home, About, Contact and hosting/domain/email hub pages, their SEO, the header & footer menus and site settings
            from Sanity into this CMS. Existing CMS content is never overwritten, so it&apos;s safe to run again.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" className={checkboxClassName} />
            Publish imported pages immediately (otherwise they import as drafts and Sanity keeps serving them)
          </label>
          <FormMessage state={importState} />
          <SubmitButton variant="outline" className="self-start" pendingLabel="Importing…">
            <DownloadCloud />
            Import from Sanity
          </SubmitButton>
        </form>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Saving anything in the admin already refreshes the website. Use this only if you edited the database directly.
          </p>
          <FormMessage state={cacheState} />
          <ActionButton variant="outline" className="self-start" action={clearWebsiteCacheAction} onDone={setCacheState}>
            <RefreshCw />
            Clear website cache
          </ActionButton>
        </div>
      </div>
    </Panel>
  )
}
