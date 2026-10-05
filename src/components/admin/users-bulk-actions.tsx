"use client"

import { UserCheck, UserX } from "lucide-react"

import { bulkSetUsersActiveAction } from "@/lib/admin/actions/users"

import { BulkActionBar, BulkConfirmButton } from "./bulk-selection"

const users = (count: number) => `${count} ${count === 1 ? "user" : "users"}`

export function UsersBulkActions() {
  return (
    <BulkActionBar noun={["user", "users"]}>
      <BulkConfirmButton
        run={(ids) => bulkSetUsersActiveAction(ids, true)}
        title={(count) => `Activate ${users(count)}?`}
        description={() => "They can sign in to the admin again with their existing password."}
        confirmLabel="Activate"
      >
        <UserCheck />
        Activate
      </BulkConfirmButton>
      <BulkConfirmButton
        run={(ids) => bulkSetUsersActiveAction(ids, false)}
        title={(count) => `Deactivate ${users(count)}?`}
        description={() =>
          "They are signed out on their next request and can't sign in until reactivated. Their accounts and history are kept. At least one active Super Admin must remain."
        }
        confirmLabel="Deactivate"
        destructive
      >
        <UserX />
        Deactivate
      </BulkConfirmButton>
    </BulkActionBar>
  )
}
