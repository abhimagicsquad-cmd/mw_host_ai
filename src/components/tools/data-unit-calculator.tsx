"use client"

import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { byteUnits, formatNumber, fromBytes, toBytes, type ByteUnit } from "@/lib/unit-conversions"

export function DataUnitCalculator() {
  const valueId = useId()
  const [value, setValue] = useState("1")
  const [unit, setUnit] = useState<ByteUnit>("GB")

  const numericValue = Number(value)
  const isValid = Number.isFinite(numericValue) && numericValue >= 0
  const bytes = isValid ? toBytes(numericValue, unit) : 0

  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={valueId}>Value</Label>
          <Input id={valueId} type="number" min="0" step="any" value={value} onChange={(event) => setValue(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Unit</Label>
          <Select value={unit} onValueChange={(next) => setUnit(next as ByteUnit)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unit">{(current: string) => current}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {byteUnits.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-5">
        {byteUnits.map((targetUnit) => (
          <div key={targetUnit} className="flex flex-col items-center gap-1 rounded-xl bg-surface-alt py-5 text-center">
            <p className="font-heading text-lg font-bold text-brand-navy">{isValid ? formatNumber(fromBytes(bytes, targetUnit), 4) : "—"}</p>
            <p className="text-xs font-medium text-muted-foreground">{targetUnit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
