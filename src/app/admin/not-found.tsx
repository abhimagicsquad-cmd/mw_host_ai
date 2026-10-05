import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

/** notFound() inside the dashboard: a plain admin page, never the public site's chrome or custom code. */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Not found</p>
      <h1 className="text-2xl font-semibold">That item doesn&apos;t exist (any more)</h1>
      <p className="max-w-md text-sm text-muted-foreground">It may have been deleted, or the link is out of date.</p>
      <Link href="/admin/dashboard" className={buttonVariants({ variant: "outline" })}>
        Back to the dashboard
      </Link>
    </div>
  )
}
