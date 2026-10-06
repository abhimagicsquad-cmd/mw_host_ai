import type { Metadata } from "next"
import Link from "next/link"
import { Pencil, UserPlus } from "lucide-react"

import { BulkSelectionProvider, RowCheckbox, SelectAllCheckbox } from "@/components/admin/bulk-selection"
import { UserDeleteButton } from "@/components/admin/user-delete-button"
import { UsersBulkActions } from "@/components/admin/users-bulk-actions"
import { formatDate, PageHeader, Panel, Pill, ProblemNotice, Table, Td, Th } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { ROLE_LABELS } from "@/lib/admin/permissions"
import { listTwoFactorStatus, listUsers } from "@/lib/admin/queries"
import { isTwoFactorRequired } from "@/lib/admin/two-factor"

export const metadata: Metadata = { title: "Admin users" }

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const admin = await requireAdmin("users.manage")
  const { created } = await searchParams
  const [{ data, problem }, twoFactor] = await Promise.all([listUsers(), listTwoFactorStatus()])

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
        {/* Your own account can't be bulk-changed, so it isn't selectable. */}
        <BulkSelectionProvider ids={data.filter((user) => user.id !== admin.id).map((user) => user.id)}>
          <UsersBulkActions />
          <Table>
            <thead>
              <tr>
                <Th className="w-10 pr-0">
                  <SelectAllCheckbox label="Select all users" />
                </Th>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>2FA</Th>
                <Th>Last sign-in</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <Td className="w-10 pr-0">
                    <RowCheckbox
                      id={user.id}
                      label={`Select ${user.username}`}
                      disabled={user.id === admin.id}
                      title={user.id === admin.id ? "You can't change your own account here" : undefined}
                    />
                  </Td>
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
                  <Td>
                    {!twoFactor ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : twoFactor[user.id] ? (
                      <Pill className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">On</Pill>
                    ) : isTwoFactorRequired(user.role) ? (
                      <Pill className="bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">Setup pending</Pill>
                    ) : (
                      <Pill>Off</Pill>
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
        </BulkSelectionProvider>
      </Panel>
    </div>
  )
}
