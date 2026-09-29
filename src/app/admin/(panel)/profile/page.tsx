import type { Metadata } from "next"

import { ChangePasswordForm } from "@/components/admin/change-password-form"
import { PageHeader, Panel } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { ROLE_LABELS } from "@/lib/admin/permissions"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
  const admin = await requireAdmin()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile & password" description={`Signed in as ${admin.username} · ${ROLE_LABELS[admin.role]}`} />
      {admin.must_change_password && !admin.isBootstrap ? (
        <p role="alert" className="max-w-xl rounded-xl border border-admin-secondary/40 bg-admin-secondary/10 px-4 py-3 text-sm">
          Your account is using a temporary password. Set a new password to continue to the rest of the admin.
        </p>
      ) : null}
      <Panel title="Change password" className="max-w-xl">
        {admin.isBootstrap ? (
          <p className="text-sm text-muted-foreground">The temporary bootstrap login is configured through environment variables and has no stored password.</p>
        ) : (
          <ChangePasswordForm />
        )}
      </Panel>
    </div>
  )
}
