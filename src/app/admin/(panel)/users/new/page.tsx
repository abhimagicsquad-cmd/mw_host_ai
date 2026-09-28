import type { Metadata } from "next"

import { UserForm } from "@/components/admin/user-form"
import { PageHeader } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Add user" }

export default async function NewUserPage() {
  await requireAdmin("users.manage")
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add user" breadcrumbs={[{ label: "Users", href: "/admin/users" }, { label: "New" }]} />
      <UserForm />
    </div>
  )
}
