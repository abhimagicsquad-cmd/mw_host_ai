import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { UserForm } from "@/components/admin/user-form"
import { formatDate, PageHeader, ProblemNotice } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { getUser } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "Edit user" }

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin("users.manage")
  const { id } = await params
  const { data: user, problem } = await getUser(id)
  if (!problem && !user) notFound()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user ? user.full_name || user.username : "Edit user"}
        breadcrumbs={[{ label: "Users", href: "/admin/users" }, { label: user?.username ?? "Edit" }]}
        description={user ? `Created ${formatDate(user.created_at, false)} · last sign-in ${formatDate(user.last_login_at)}` : undefined}
      />
      <ProblemNotice problem={problem} />
      {user ? <UserForm user={user} isSelf={user.id === admin.id} /> : null}
    </div>
  )
}
