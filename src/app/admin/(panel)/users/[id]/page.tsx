import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { UserTwoFactorReset } from "@/components/admin/security/user-two-factor-reset"
import { UserForm } from "@/components/admin/user-form"
import { formatDate, PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { getUser, listTwoFactorStatus } from "@/lib/admin/queries"
import { isTwoFactorRequired } from "@/lib/admin/two-factor"

export const metadata: Metadata = { title: "Edit user" }

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin("users.manage")
  const { id } = await params
  const [{ data: user, problem }, twoFactor] = await Promise.all([getUser(id), listTwoFactorStatus()])
  if (!problem && !user) notFound()
  const enabledAt = user && twoFactor ? twoFactor[user.id] : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user ? user.full_name || user.username : "Edit user"}
        breadcrumbs={[{ label: "Users", href: "/admin/users" }, { label: user?.username ?? "Edit" }]}
        description={user ? `Created ${formatDate(user.created_at, false)} · last sign-in ${formatDate(user.last_login_at)}` : undefined}
      />
      <ProblemNotice problem={problem} />
      {user ? <UserForm user={user} isSelf={user.id === admin.id} /> : null}
      {user && twoFactor ? (
        <Panel
          title="Two-factor authentication"
          description={
            enabledAt
              ? `On since ${formatDate(enabledAt, false)}.`
              : isTwoFactorRequired(user.role)
                ? "Not set up yet — required for this role, so they'll be asked to set it up at their next sign-in."
                : "Off (optional for editors)."
          }
          className="max-w-3xl"
        >
          {user.id === admin.id ? (
            <p className="text-sm text-muted-foreground">Manage your own two-factor authentication under My Account → Security.</p>
          ) : (
            <UserTwoFactorReset userId={user.id} username={user.username} required={isTwoFactorRequired(user.role)} enabled={Boolean(enabledAt)} />
          )}
        </Panel>
      ) : null}
    </div>
  )
}
