"use client"

import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  bitRateUnits,
  byteUnits,
  formatDuration,
  toBitsPerSecond,
  toBytes,
  type BitRateUnit,
  type ByteUnit,
} from "@/lib/unit-conversions"

export function TransferTimeCalculator() {
  const sizeId = useId()
  const speedId = useId()

  const [sizeValue, setSizeValue] = useState("500")
  const [sizeUnit, setSizeUnit] = useState<ByteUnit>("MB")
  const [speedValue, setSpeedValue] = useState("100")
  const [speedUnit, setSpeedUnit] = useState<BitRateUnit>("Mbps")

  const size = Number(sizeValue)
  const speed = Number(speedValue)
  const isValid = Number.isFinite(size) && size >= 0 && Number.isFinite(speed) && speed > 0

  const fileSizeBits = isValid ? toBytes(size, sizeUnit) * 8 : 0
  const speedBitsPerSecond = isValid ? toBitsPerSecond(speed, speedUnit) : 0
  const durationSeconds = isValid ? fileSizeBits / speedBitsPerSecond : 0

  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={sizeId}>File size</Label>
          <div className="flex gap-2">
            <Input id={sizeId} type="number" min="0" step="any" value={sizeValue} onChange={(event) => setSizeValue(event.target.value)} />
            <Select value={sizeUnit} onValueChange={(next) => setSizeUnit(next as ByteUnit)}>
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue placeholder="Unit">{(current: string) => current}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {byteUnits
                  .filter((unit) => unit !== "Bytes")
                  .map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={speedId}>Internet speed</Label>
          <div className="flex gap-2">
            <Input id={speedId} type="number" min="0" step="any" value={speedValue} onChange={(event) => setSpeedValue(event.target.value)} />
            <Select value={speedUnit} onValueChange={(next) => setSpeedUnit(next as BitRateUnit)}>
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue placeholder="Unit">{(current: string) => current}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {bitRateUnits.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 rounded-xl bg-surface-alt py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Estimated transfer time</p>
        <p className="text-4xl font-bold text-brand-navy">{isValid ? formatDuration(durationSeconds) : "—"}</p>
      </div>
    </div>
  )
}
