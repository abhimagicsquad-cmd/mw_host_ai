import { Eye } from "lucide-react"

import { isCmsPreview } from "@/lib/cms/content"

/** Fixed bar shown only while an admin is previewing CMS drafts on the website. */
export async function PreviewBanner() {
  if (!(await isCmsPreview())) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-3 bg-brand-navy px-4 py-2.5 text-sm text-white shadow-lg">
      <Eye className="size-4 shrink-0 text-brand-orange" aria-hidden />
      <span>Preview mode — you&apos;re seeing unpublished CMS drafts. Visitors still see the live site.</span>
      {/* Plain anchor: the exit route handler sets cookies and redirects back here. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/admin/preview/exit" className="rounded-md bg-white/10 px-2.5 py-1 font-medium hover:bg-white/20">
        Exit preview
      </a>
    </div>
  )
}
