"use client"

import { useState } from "react"
import { ShieldOff } from "lucide-react"

import { resetUserTwoFactorAction } from "@/lib/admin/actions/two-factor"
import type { ActionState } from "@/lib/cms/types"

import { ConfirmActionButton, FormMessage } from "../form-controls"

/** Super admins: clear another user's 2FA (lost phone and recovery codes). */
export function UserTwoFactorReset({ userId, username, required, enabled }: { userId: string; username: string; required: boolean; enabled: boolean }) {
  const [state, setState] = useState<ActionState>()
  return (
    <div className="flex flex-col gap-3">
      <ConfirmActionButton
        variant="outline"
        destructive
        className="self-start"
        title={`Reset two-factor authentication for “${username}”?`}
        description={`This removes their authenticator secret, recovery codes and trusted devices, and signs them out. ${
          required ? "Their role requires 2FA, so they'll have to set it up again before they can use the dashboard." : "They can turn it on again from My Account → Security."
        } Only do this after confirming their identity.`}
        confirmLabel="Reset 2FA"
        action={() => resetUserTwoFactorAction(userId)}
        onDone={setState}
        disabled={!enabled}
      >
        <ShieldOff />
        Reset two-factor authentication
      </ConfirmActionButton>
      <FormMessage state={state} />
    </div>
  )
}
