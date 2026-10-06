import { cookies } from "next/headers"

import { AdminBrand, AdminSidebarNav } from "@/components/admin/admin-sidebar"
import { ADMIN_THEME_COOKIE } from "@/components/admin/admin-theme"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { requireAdmin } from "@/lib/admin/auth"

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // The shell renders for users who still have to set up 2FA (the Security page lives in it);
  // every page and action under it enforces the setup itself (requireAdmin / authorizeAction).
  const admin = await requireAdmin(undefined, { allowTwoFactorSetup: true })
  const setupOnly = admin.twoFactorSetupRequired
  const dark = (await cookies()).get(ADMIN_THEME_COOKIE)?.value === "dark"

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto bg-admin-sidebar text-admin-sidebar-foreground lg:flex">
        <AdminBrand />
        <AdminSidebarNav role={admin.role} setupOnly={setupOnly} />
        <div className="mt-auto border-t border-white/10 px-6 py-4 text-[11px] text-admin-sidebar-muted">
          Changes publish to the live website instantly.
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <AdminTopbar user={{ username: admin.username, fullName: admin.full_name, role: admin.role, setupOnly }} dark={dark} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
