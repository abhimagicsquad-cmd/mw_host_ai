export const byteUnits = ["Bytes", "KB", "MB", "GB", "TB"] as const
export type ByteUnit = (typeof byteUnits)[number]

const byteUnitMultipliers: Record<ByteUnit, number> = {
  Bytes: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
}

export function toBytes(value: number, unit: ByteUnit) {
  return value * byteUnitMultipliers[unit]
}

export function fromBytes(bytes: number, unit: ByteUnit) {
  return bytes / byteUnitMultipliers[unit]
}

export const bitRateUnits = ["Kbps", "Mbps", "Gbps"] as const
export type BitRateUnit = (typeof bitRateUnits)[number]

const bitRateMultipliers: Record<BitRateUnit, number> = {
  Kbps: 1000,
  Mbps: 1000 ** 2,
  Gbps: 1000 ** 3,
}

export function toBitsPerSecond(value: number, unit: BitRateUnit) {
  return value * bitRateMultipliers[unit]
}

/** Formats a duration in seconds as a compact "1d 2h 3m 4s" style string. */
export function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—"
  if (totalSeconds < 1) return `${Math.round(totalSeconds * 1000)} ms`

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.round(totalSeconds % 60)

  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (seconds || parts.length === 0) parts.push(`${seconds}s`)
  return parts.join(" ")
}

export function formatNumber(value: number, maxFractionDigits = 2) {
  if (!Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: maxFractionDigits }).format(value)
}
