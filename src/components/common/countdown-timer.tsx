"use client"

import { useEffect, useState } from "react"

type CountdownTimerProps = {
  /** ISO 8601 timestamp the countdown counts down to. */
  targetDate: string
  className?: string
}

const UNITS = [
  { key: "days", ms: 86_400_000, label: "Days" },
  { key: "hours", ms: 3_600_000, label: "Hours" },
  { key: "minutes", ms: 60_000, label: "Minutes" },
  { key: "seconds", ms: 1_000, label: "Seconds" },
] as const

function splitRemaining(remainingMs: number) {
  let rest = remainingMs
  return UNITS.map((unit) => {
    const value = Math.floor(rest / unit.ms)
    rest -= value * unit.ms
    return { ...unit, value }
  })
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  // Starts null so server and client render the same placeholder on first paint —
  // avoids a hydration mismatch from computing Date.now() during SSR.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const remainingMs = now === null ? null : Math.max(0, new Date(targetDate).getTime() - now)
  const units = remainingMs === null ? UNITS.map((unit) => ({ ...unit, value: 0 })) : splitRemaining(remainingMs)
  const hasEnded = remainingMs !== null && remainingMs <= 0

  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-3 sm:gap-4" role="timer" aria-live="off">
        {units.map((unit) => (
          <div key={unit.key} className="flex min-w-16 flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-3 sm:min-w-20 sm:px-4">
            <span className="text-2xl font-bold text-white sm:text-3xl tabular-nums">
              {hasEnded ? "0" : String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-medium tracking-wide text-white/60 uppercase">{unit.label}</span>
          </div>
        ))}
      </div>
      {hasEnded ? <p className="mt-3 text-center text-sm text-white/70">This offer has ended — ask us about current promotions.</p> : null}
    </div>
  )
}
