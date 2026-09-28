"use client"

import { useState } from "react"

type Point = { date: string; count: number }

function label(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
}

/** Single-series daily bar chart. Thin bars, rounded data-end, 2px gaps, recessive grid, hover tooltip. */
export function LeadsChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(4, ...data.map((d) => d.count))
  const step = Math.ceil(max / 4)
  const top = step * 4
  const ticks = [0, step, step * 2, step * 3, top]
  const active = hover !== null ? data[hover] : null

  return (
    <div>
      <div className="relative flex h-52 gap-3">
        <div className="flex flex-col-reverse justify-between pb-6 text-right text-[11px] text-muted-foreground tabular-nums" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 leading-none first:translate-y-0">
              {tick}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col-reverse justify-between" aria-hidden>
            {ticks.map((tick) => (
              <div key={tick} className={tick === 0 ? "border-t border-border" : "border-t border-dashed border-border/70"} />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {data.map((point, index) => (
              <button
                key={point.date}
                type="button"
                className="group relative flex h-full flex-1 items-end outline-none"
                onMouseEnter={() => setHover(index)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
                aria-label={`${label(point.date)}: ${point.count} leads`}
              >
                <span
                  className="w-full rounded-t-[4px] bg-admin-chart transition-opacity group-focus-visible:ring-2 group-focus-visible:ring-ring"
                  style={{ height: `${(point.count / top) * 100}%`, minHeight: point.count ? 3 : 0, opacity: hover === null || hover === index ? 1 : 0.45 }}
                />
              </button>
            ))}
          </div>
          {active && hover !== null ? (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
              style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
            >
              <p className="text-muted-foreground">{label(active.date)}</p>
              <p className="font-semibold tabular-nums">
                {active.count} lead{active.count === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] text-muted-foreground" aria-hidden>
            <span>{data[0] ? label(data[0].date) : ""}</span>
            <span>{data[Math.floor(data.length / 2)] ? label(data[Math.floor(data.length / 2)].date) : ""}</span>
            <span>{data.at(-1) ? label(data.at(-1)!.date) : ""}</span>
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Leads per day, last 30 days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Leads</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{label(point.date)}</td>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
