"use client"

import { type ReactNode, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Tabs whose panels stay mounted (hidden with CSS) so unsaved edits in one tab survive
 * switching to another.
 */
export function PageEditorTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id)

  return (
    <div>
      <div role="tablist" aria-label="Page editor" className="mb-5 flex gap-1 overflow-x-auto border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active === tab.id ? "border-admin-secondary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} hidden={active !== tab.id}>
          {tab.content}
        </div>
      ))}
    </div>
  )
}
