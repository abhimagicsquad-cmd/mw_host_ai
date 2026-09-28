import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Upload } from "lucide-react"

import { MediaLibrary } from "@/components/admin/media-library"
import { PageHeader, ProblemNotice } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { listMedia } from "@/lib/admin/queries"
import type { MediaFolder } from "@/lib/cms/types"

const FOLDERS: Record<MediaFolder, { title: string; description: string }> = {
  images: { title: "Images", description: "Photos, illustrations and banners (JPG, PNG, WEBP)." },
  icons: { title: "Icons", description: "Logos and icons (SVG, PNG)." },
  documents: { title: "Documents", description: "PDF brochures, price lists and policies." },
}

export async function generateMetadata({ params }: { params: Promise<{ folder: string }> }): Promise<Metadata> {
  const { folder } = await params
  return { title: `Media · ${FOLDERS[folder as MediaFolder]?.title ?? "Library"}` }
}

export default async function MediaFolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const admin = await requireAdmin()
  const { folder } = await params
  const config = FOLDERS[folder as MediaFolder]
  if (!config) notFound()

  const { data, problem } = await listMedia({ folder: folder as MediaFolder })
  const canManage = can(admin.role, "media.manage")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[{ label: "Media Library" }, { label: config.title }]}
        actions={
          canManage ? (
            <Link href="/admin/media/upload" className={buttonVariants()}>
              <Upload />
              Upload media
            </Link>
          ) : null
        }
      />
      <nav aria-label="Media folders" className="flex gap-1 border-b">
        {(Object.keys(FOLDERS) as MediaFolder[]).map((key) => (
          <Link
            key={key}
            href={`/admin/media/${key}`}
            aria-current={key === folder ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${key === folder ? "border-admin-secondary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {FOLDERS[key].title}
          </Link>
        ))}
      </nav>
      <ProblemNotice problem={problem} />
      {!problem ? <MediaLibrary items={data} canManage={canManage} /> : null}
    </div>
  )
}
