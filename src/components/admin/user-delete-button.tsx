"use client"

import { Trash2 } from "lucide-react"

import { deleteUserAction } from "@/lib/admin/actions/users"

import { ConfirmActionButton } from "./form-controls"

export function UserDeleteButton({ userId, username }: { userId: string; username: string }) {
  return (
    <ConfirmActionButton
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${username}`}
      destructive
      title={`Delete user “${username}”?`}
      description="They lose access immediately. Their past activity stays in the log. Consider deactivating instead if you may need the account again."
      confirmLabel="Delete user"
      action={() => deleteUserAction(userId)}
    >
      <Trash2 className="text-destructive" />
    </ConfirmActionButton>
  )
}
