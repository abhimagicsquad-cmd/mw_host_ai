import type { Metadata } from "next"
import Link from "next/link"
import { Pencil, UserPlus } from "lucide-react"

import { UserDeleteButton } from "@/components/admin/user-delete-button"
import { formatDate, PageHeader, Panel, Pill, ProblemNotice, Table, Td, Th } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { ROLE_LABELS } from "@/lib/admin/permissions"
import { listUsers } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "Admin users" }

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const admin = await requireAdmin("users.manage")
  const { created } = await searchParams
  const { data, problem } = await listUsers()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin users"
        description="People who can sign in to this admin."
        breadcrumbs={[{ label: "Users" }, { label: "Admin users" }]}
        actions={
          <Link href="/admin/users/new" className={buttonVariants()}>
            <UserPlus />
            Add user
          </Link>
        }
      />
      {created ? (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          User created. Share the password with them securely.
        </p>
      ) : null}
      <ProblemNotice problem={problem} />
      <Panel bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last sign-in</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <Td>
                  <p className="font-medium">
                    {user.full_name || user.username}
                    {user.id === admin.id ? <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                    {user.email ? ` · ${user.email}` : ""}
                  </p>
                </Td>
                <Td>
                  <Pill className={user.role === "super_admin" ? "bg-primary/10 text-primary" : undefined}>{ROLE_LABELS[user.role]}</Pill>
                </Td>
                <Td>
                  {user.is_active ? (
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">Active</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Deactivated</span>
                  )}
                </Td>
                <Td className="text-muted-foreground">{formatDate(user.last_login_at)}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/users/${user.id}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${user.username}`}>
                      <Pencil className="size-4" />
                    </Link>
                    {user.id !== admin.id ? <UserDeleteButton userId={user.id} username={user.username} /> : null}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  )
}
