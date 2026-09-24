"use client"

import { useId, useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/unit-conversions"

const COMMISSION_RATE = 0.2

export function AffiliateEarningsCalculator() {
  const referralsId = useId()
  const valueId = useId()

  const [referralsPerMonth, setReferralsPerMonth] = useState("3")
  const [avgMonthlyValue, setAvgMonthlyValue] = useState("500")

  const referrals = Number(referralsPerMonth)
  const monthlyValue = Number(avgMonthlyValue)
  const isValid = Number.isFinite(referrals) && referrals >= 0 && Number.isFinite(monthlyValue) && monthlyValue >= 0

  const commissionPerReferral = monthlyValue * COMMISSION_RATE

  // Recurring commission compounds as referrals keep coming in — by month N you're still
  // earning on every referral from every prior month, not just the latest batch.
  const monthlyIncome = useMemo(
    () => Array.from({ length: 12 }, (_, index) => (isValid ? commissionPerReferral * referrals * (index + 1) : 0)),
    [isValid, commissionPerReferral, referrals]
  )

  const month12Income = monthlyIncome[11] ?? 0
  const yearTotal = monthlyIncome.reduce((sum, value) => sum + value, 0)
  const maxIncome = Math.max(...monthlyIncome, 1)

  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={referralsId}>New referrals per month</Label>
          <Input id={referralsId} type="number" min="0" step="1" value={referralsPerMonth} onChange={(event) => setReferralsPerMonth(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={valueId}>Avg. customer bill (₹/month)</Label>
          <Input id={valueId} type="number" min="0" step="50" value={avgMonthlyValue} onChange={(event) => setAvgMonthlyValue(event.target.value)} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-alt py-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">Your monthly income by month 12</p>
          <p className="text-3xl font-bold text-brand-navy">{isValid ? `₹${formatNumber(month12Income)}` : "—"}</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-alt py-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">Your passive income in year 1</p>
          <p className="text-3xl font-bold text-brand-navy">{isValid ? `₹${formatNumber(yearTotal)}` : "—"}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Monthly recurring income, month 1-12</p>
        <div className="flex items-end gap-1.5 sm:gap-2">
          {monthlyIncome.map((amount, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full min-h-1 rounded-t-md bg-gradient-to-t from-brand-orange to-amber-300"
                style={{ height: `${Math.max(4, (amount / maxIncome) * 96)}px` }}
                title={`Month ${index + 1}: ₹${formatNumber(amount)}`}
              />
              <span className="text-[10px] text-muted-foreground">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Assumes 20% recurring commission on every referral, referrals arriving at a steady monthly rate, and customers remaining active.
        Illustrative only — actual earnings depend on referral quality and customer retention.
      </p>
    </div>
  )
}
