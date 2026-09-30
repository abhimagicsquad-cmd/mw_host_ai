"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

import { clearWebsiteCacheAction } from "@/lib/admin/actions/settings"
import type { ActionState } from "@/lib/cms/types"

import { ActionButton, FormMessage } from "./form-controls"
import { Panel } from "./ui"

export function SystemTools() {
  const [cacheState, setCacheState] = useState<ActionState>()

  return (
    <Panel title="Maintenance" description="Website cache controls">
      <div className="grid gap-6 lg:grid-cols-2">
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
