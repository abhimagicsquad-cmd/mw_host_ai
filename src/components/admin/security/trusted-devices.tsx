"use client"

import { Laptop, Trash2 } from "lucide-react"

import { removeAllTrustedDevicesAction, removeTrustedDeviceAction } from "@/lib/admin/actions/two-factor"

import { ConfirmActionButton } from "../form-controls"
import { EmptyState, Panel, Pill, Table, Td, Th } from "../ui"

export type TrustedDeviceRow = {
  id: string
  label: string
  ip: string | null
  added: string
  lastUsed: string
  expires: string
  current: boolean
}

/** Browsers that skip the code step for 30 days ("Remember this device" at sign-in). */
export function TrustedDevices({ devices }: { devices: TrustedDeviceRow[] }) {
  return (
    <Panel
      title="Trusted devices"
      description="Browsers where you chose “Remember this device for 30 days”. They still need your password. Remove any you don't recognise."
      actions={
        devices.length ? (
          <ConfirmActionButton
            variant="outline"
            size="sm"
            destructive
            title="Remove all trusted devices?"
            description="Every browser will ask for an authentication code at its next sign-in, including this one."
            confirmLabel="Remove all"
            action={() => removeAllTrustedDevicesAction()}
          >
            Remove all
          </ConfirmActionButton>
        ) : null
      }
      bodyClassName="p-0"
    >
      {devices.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Device</Th>
              <Th>Last used</Th>
              <Th>Trusted until</Th>
              <Th className="text-right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <Td>
                  <div className="flex items-center gap-2 font-medium">
                    {device.label}
                    {device.current ? <Pill className="bg-primary/10 text-primary">This device</Pill> : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Added {device.added}
                    {device.ip ? ` · ${device.ip}` : ""}
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-muted-foreground">{device.lastUsed}</Td>
                <Td className="whitespace-nowrap text-muted-foreground">{device.expires}</Td>
                <Td className="text-right">
                  <ConfirmActionButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${device.label}`}
                    destructive
                    title={`Remove “${device.label}”?`}
                    description="It will ask for an authentication code at its next sign-in."
                    confirmLabel="Remove device"
                    action={() => removeTrustedDeviceAction(device.id)}
                  >
                    <Trash2 className="text-destructive" />
                  </ConfirmActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState icon={Laptop} title="No trusted devices" description="Tick “Remember this device for 30 days” when you enter your code to skip it on that browser." />
      )}
    </Panel>
  )
}
