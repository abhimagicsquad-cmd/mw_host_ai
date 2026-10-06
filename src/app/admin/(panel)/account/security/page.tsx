import type { Metadata } from "next"
import { AlertTriangle, Clock, KeyRound, Laptop, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react"

import { TrustedDevices } from "@/components/admin/security/trusted-devices"
import { TwoFactorManager } from "@/components/admin/security/two-factor-manager"
import { formatDate, PageHeader, Panel } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { ROLE_LABELS } from "@/lib/admin/permissions"
import { getTrustedDeviceCookie } from "@/lib/admin/session-cookie"
import { formatSecretForDisplay, isTwoFactorConfigured, otpauthUri, qrCodeSvg, RECOVERY_CODE_COUNT } from "@/lib/admin/two-factor"
import { getTwoFactorRecord, listRecoveryCodeStatus, listTrustedDevices, pendingSecret } from "@/lib/admin/two-factor-store"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Security" }

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ recovery?: string }> }) {
  // Reachable while required 2FA is still being set up — everything else redirects here.
  const admin = await requireAdmin(undefined, { allowTwoFactorSetup: true })
  const { recovery: recoveryParam } = await searchParams
  const { twoFactor } = admin

  const header = (
    <PageHeader
      title="Security"
      description={`Two-factor authentication, recovery codes and trusted devices for ${admin.username} · ${ROLE_LABELS[admin.role]}`}
      breadcrumbs={[{ label: "My Account" }, { label: "Security" }]}
    />
  )

  if (admin.isBootstrap) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Panel>
          <p className="text-sm text-muted-foreground">
            The temporary bootstrap login has no stored account, so it can&apos;t use two-factor authentication. Create a user under Users and sign
            in with it — the bootstrap login switches off once a user exists.
          </p>
        </Panel>
      </div>
    )
  }

  if (twoFactor.storageMissing || !isTwoFactorConfigured()) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Notice tone="warning" icon={AlertTriangle} title="Two-factor authentication isn't set up on the server yet">
          {twoFactor.storageMissing ? (
            <>
              Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-500/20">supabase/migrations/0007_admin_two_factor.sql</code> in the
              Supabase SQL editor, then reload this page.
            </>
          ) : (
            <>Set ADMIN_2FA_ENCRYPTION_KEY in the environment and redeploy.</>
          )}{" "}
          {twoFactor.required ? "Until then, the dashboard stays locked for super admins and admins." : null}
        </Notice>
      </div>
    )
  }

  const [record, recoveryCodes, devices, deviceCookie] = await Promise.all([
    getTwoFactorRecord(admin.id),
    listRecoveryCodeStatus(admin.id),
    listTrustedDevices(admin.id),
    getTrustedDeviceCookie(),
  ])
  const pendingKey = pendingSecret(record)
  const pending = pendingKey
    ? { qrSvg: await qrCodeSvg(otpauthUri(admin.username, pendingKey)), secret: formatSecretForDisplay(pendingKey), rotating: twoFactor.enabled }
    : null
  const remaining = recoveryCodes.filter((code) => !code.used_at).length

  const checks = [
    { ok: twoFactor.enabled, label: twoFactor.enabled ? "Two-factor authentication is on" : "Two-factor authentication is off" },
    { ok: !twoFactor.enabled || remaining > 3, label: twoFactor.enabled ? `${remaining} recovery codes left` : "Recovery codes are issued with 2FA" },
    { ok: !admin.must_change_password, label: admin.must_change_password ? "Temporary password — change it under Profile" : "Password set by you" },
  ]
  const score = checks.filter((check) => check.ok).length

  return (
    <div className="flex flex-col gap-6">
      {header}

      {admin.twoFactorSetupRequired ? (
        <Notice tone="warning" icon={ShieldAlert} title="Set up two-factor authentication to continue">
          Two-factor authentication is mandatory for {ROLE_LABELS[admin.role].toLowerCase()}s. The rest of the dashboard is locked until it&apos;s
          set up and verified.
        </Notice>
      ) : null}
      {recoveryParam === "used" && twoFactor.enabled ? (
        <Notice tone="warning" icon={KeyRound} title="You signed in with a recovery code">
          That code no longer works. {remaining} left. If you&apos;ve lost your phone, use “Regenerate secret” to move to a new app, and generate new
          recovery codes.
        </Notice>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon={twoFactor.enabled ? ShieldCheck : ShieldAlert}
          label="Two-factor authentication"
          value={twoFactor.enabled ? "On" : twoFactor.required ? "Required" : "Off"}
          detail={twoFactor.enabled ? `Since ${formatDate(twoFactor.enabledAt, false)}` : twoFactor.required ? "Mandatory for your role" : "Optional for your role"}
          tone={twoFactor.enabled ? "good" : twoFactor.required ? "bad" : "neutral"}
        />
        <Tile
          icon={KeyRound}
          label="Recovery codes"
          value={twoFactor.enabled ? `${remaining} / ${recoveryCodes.length || RECOVERY_CODE_COUNT}` : "—"}
          detail={twoFactor.enabled ? "Unused codes left" : "Issued when 2FA is turned on"}
          tone={!twoFactor.enabled ? "neutral" : remaining > 3 ? "good" : "bad"}
        />
        <Tile icon={Laptop} label="Trusted devices" value={String(devices.length)} detail="Skip the code for 30 days" tone="neutral" />
        <Tile icon={Clock} label="Last verification" value={twoFactor.lastVerifiedAt ? formatDate(twoFactor.lastVerifiedAt) : "Never"} detail="Last accepted code" tone="neutral" small />
      </div>

      <Panel title="Security status" description={`${score} of ${checks.length} checks passed`}>
        <ul className="flex flex-col gap-2 text-sm">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", check.ok ? "bg-emerald-500" : "bg-destructive")} aria-hidden />
              <span>{check.label}</span>
              <span className="sr-only">{check.ok ? "(passed)" : "(needs attention)"}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <TwoFactorManager
        username={admin.username}
        enabled={twoFactor.enabled}
        required={twoFactor.required}
        pending={pending}
        recovery={{ remaining, total: recoveryCodes.length, codes: recoveryCodes.map((code) => ({ id: code.id, usedAt: code.used_at })) }}
        usedLabels={Object.fromEntries(recoveryCodes.filter((code) => code.used_at).map((code) => [code.id, formatDate(code.used_at)]))}
      />

      {twoFactor.enabled ? (
        <TrustedDevices
          devices={devices.map((device) => ({
            id: device.id,
            label: device.label ?? "Unknown device",
            ip: device.ip_address,
            added: formatDate(device.created_at, false),
            lastUsed: formatDate(device.last_used_at),
            expires: formatDate(device.expires_at, false),
            current: deviceCookie?.deviceId === device.id,
          }))}
        />
      ) : null}
    </div>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  small,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  tone: "good" | "bad" | "neutral"
  small?: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            tone === "good" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
            tone === "bad" && "bg-destructive/10 text-destructive",
            tone === "neutral" && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className={cn("mt-3 font-semibold tracking-tight tabular-nums", small ? "text-base" : "text-3xl")}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function Notice({ tone, icon: Icon, title, children }: { tone: "warning"; icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        tone === "warning" && "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1">{children}</p>
      </div>
    </div>
  )
}
