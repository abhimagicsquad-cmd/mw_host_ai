"use client"

import { useEffect, useState } from "react"

type CountdownTimerProps = {
  /** ISO 8601 timestamp the countdown counts down to. */
  targetDate: string
  /** Heading shown above the timer (e.g. "Offer ends in"). */
  label?: string
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

export function CountdownTimer({ targetDate, label, className }: CountdownTimerProps) {
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
  // The campaign's plans stay on sale after the date (as on WordPress, which had no timer),
  // so an expired or missing deadline just hides the countdown.
  if (hasEnded || Number.isNaN(new Date(targetDate).getTime())) return null

  return (
    <div className={className}>
      {label ? <p className="mb-3 text-center text-xs font-semibold tracking-wide text-white/60 uppercase">{label}</p> : null}
      <div className="flex items-center justify-center gap-3 sm:gap-4" role="timer" aria-live="off">
        {units.map((unit) => (
          <div key={unit.key} className="flex min-w-16 flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-3 sm:min-w-20 sm:px-4">
            <span className="text-2xl font-bold text-white sm:text-3xl tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs font-medium tracking-wide text-white/75 uppercase">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
