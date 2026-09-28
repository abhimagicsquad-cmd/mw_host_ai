"use client"

import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"

import { deleteSeoAction } from "@/lib/admin/actions/seo"

import { ConfirmActionButton } from "./form-controls"

export function SeoResetButton({ path }: { path: string }) {
  const router = useRouter()
  return (
    <ConfirmActionButton
      variant="outline"
      title={`Reset SEO for ${path}?`}
      description="All custom SEO for this URL (titles, descriptions, social cards and schema) is removed and the page's own defaults apply again."
      confirmLabel="Reset to defaults"
      destructive
      action={() => deleteSeoAction(path)}
      onDone={() => router.replace(`/admin/seo/titles`)}
    >
      <RotateCcw />
      Reset to defaults
    </ConfirmActionButton>
  )
}
