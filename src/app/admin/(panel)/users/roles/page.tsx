import type { Metadata } from "next"
import { Check, Minus } from "lucide-react"

import { PageHeader, Panel, Table, Td, Th } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { ALL_ROLES, can, PERMISSION_LABELS, type Permission, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/admin/permissions"

export const metadata: Metadata = { title: "Roles & permissions" }

export default async function RolesPage() {
  await requireAdmin("users.manage")
  const permissions = Object.keys(PERMISSION_LABELS) as Permission[]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & permissions"
        breadcrumbs={[{ label: "Users" }, { label: "Roles & permissions" }]}
        description="What each role can do. Assign roles to people under Admin users."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {ALL_ROLES.map((role) => (
          <div key={role} className="rounded-xl border bg-card p-5 shadow-xs">
            <p className="font-semibold">{ROLE_LABELS[role]}</p>
            <p className="mt-1 text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
            <p className="mt-3 text-xs text-muted-foreground tabular-nums">
              {permissions.filter((p) => can(role, p)).length} of {permissions.length} permissions
            </p>
          </div>
        ))}
      </div>
      <Panel title="Permission matrix" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Permission</Th>
              {ALL_ROLES.map((role) => (
                <Th key={role} className="text-center">
                  {ROLE_LABELS[role]}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission}>
                <Td>{PERMISSION_LABELS[permission]}</Td>
                {ALL_ROLES.map((role) => (
                  <td key={role} className="border-b px-4 py-3 text-center">
                    {can(role, permission) ? (
                      <Check className="mx-auto size-4 text-emerald-600" aria-label="Allowed" />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not allowed" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  )
}
