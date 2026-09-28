import type { Metadata } from "next"

import { MediaUploader } from "@/components/admin/media-uploader"
import { PageHeader } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Upload media" }

export default async function UploadMediaPage() {
  await requireAdmin("media.manage")
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Upload media"
        breadcrumbs={[{ label: "Media Library", href: "/admin/media/images" }, { label: "Upload" }]}
        description="Files are stored in Supabase Storage and served from a public CDN URL you can use anywhere on the site."
      />
      <MediaUploader />
    </div>
  )
}
