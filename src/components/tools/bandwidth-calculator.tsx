"use client"

import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/unit-conversions"

export function BandwidthCalculator() {
  const pageSizeId = useId()
  const visitorsId = useId()
  const pagesPerVisitId = useId()

  const [pageSizeMB, setPageSizeMB] = useState("2")
  const [visitors, setVisitors] = useState("10000")
  const [pagesPerVisit, setPagesPerVisit] = useState("4")

  const pageSize = Number(pageSizeMB)
  const monthlyVisitors = Number(visitors)
  const pageViewsPerVisit = Number(pagesPerVisit)

  const isValid = [pageSize, monthlyVisitors, pageViewsPerVisit].every((value) => Number.isFinite(value) && value >= 0)
  const totalMB = isValid ? pageSize * monthlyVisitors * pageViewsPerVisit : 0
  const totalGB = totalMB / 1024

  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={pageSizeId}>Avg. page size (MB)</Label>
          <Input id={pageSizeId} type="number" min="0" step="0.1" value={pageSizeMB} onChange={(event) => setPageSizeMB(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={visitorsId}>Avg. monthly visitors</Label>
          <Input id={visitorsId} type="number" min="0" step="1" value={visitors} onChange={(event) => setVisitors(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={pagesPerVisitId}>Avg. pages per visit</Label>
          <Input id={pagesPerVisitId} type="number" min="0" step="0.5" value={pagesPerVisit} onChange={(event) => setPagesPerVisit(event.target.value)} />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 rounded-xl bg-surface-alt py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Estimated monthly bandwidth</p>
        <p className="text-4xl font-bold text-brand-navy">
          {isValid ? formatNumber(totalGB) : "—"} <span className="text-lg font-medium text-muted-foreground">GB / month</span>
        </p>
        {isValid ? <p className="text-xs text-muted-foreground">({formatNumber(totalMB)} MB / month)</p> : null}
      </div>
    </div>
  )
}
