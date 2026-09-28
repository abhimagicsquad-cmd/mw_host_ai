import type { Metadata } from "next"
import { cookies } from "next/headers"

import { ADMIN_THEME_COOKIE, AdminThemeSync } from "@/components/admin/admin-theme"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · MWH Admin" },
  robots: { index: false, follow: false },
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const dark = (await cookies()).get(ADMIN_THEME_COOKIE)?.value === "dark"
  return (
    <div id="admin-root" className={cn("admin-theme min-h-screen bg-background text-foreground", dark && "dark")}>
      <AdminThemeSync dark={dark} />
      {children}
    </div>
  )
}
