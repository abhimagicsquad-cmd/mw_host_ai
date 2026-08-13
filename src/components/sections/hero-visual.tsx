import {
  ArrowUpRight,
  Gauge,
  Globe2,
  HeartHandshake,
  Inbox,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react"

type StatTile = { icon: LucideIcon; value: string; label: string }
type FloatingBadge = { icon: LucideIcon; label: string; sublabel: string; tone: "orange" | "emerald" }

type HeroVisualVariant = "dashboard" | "security" | "server" | "mail" | "domain" | "affiliate"

type VisualConfig = {
  statusLabel: string
  metricLabel: string
  metricValue: string
  barValues: number[]
  stats: [StatTile, StatTile]
  badgeTop: FloatingBadge
  badgeBottom: FloatingBadge
}

const VARIANTS: Record<HeroVisualVariant, VisualConfig> = {
  dashboard: {
    statusLabel: "All systems live",
    metricLabel: "Uptime, last 90 days",
    metricValue: "99.98%",
    barValues: [38, 52, 44, 70, 58, 82, 96],
    stats: [
      { icon: Zap, value: "0.7s", label: "Avg. load time" },
      { icon: Gauge, value: "NVMe", label: "Storage, every plan" },
    ],
    badgeTop: { icon: ShieldCheck, label: "Free SSL", sublabel: "On every plan", tone: "orange" },
    badgeBottom: { icon: ArrowUpRight, label: "12,000+", sublabel: "Businesses hosted", tone: "emerald" },
  },
  security: {
    statusLabel: "Certificate active",
    metricLabel: "Encryption strength",
    metricValue: "256-bit",
    barValues: [50, 62, 58, 74, 80, 88, 96],
    stats: [
      { icon: Lock, value: "A+", label: "SSL Labs grade" },
      { icon: ShieldCheck, value: "< 5 min", label: "Typical issuance" },
    ],
    badgeTop: { icon: ShieldCheck, label: "Browser trusted", sublabel: "All major browsers", tone: "orange" },
    badgeBottom: { icon: Lock, label: "Zero", sublabel: "Setup fees", tone: "emerald" },
  },
  server: {
    statusLabel: "Server online",
    metricLabel: "Uptime SLA",
    metricValue: "99.9%",
    barValues: [45, 58, 66, 62, 78, 84, 90],
    stats: [
      { icon: Gauge, value: "NVMe", label: "Storage, every tier" },
      { icon: Zap, value: "< 24 hrs", label: "Provisioning" },
    ],
    badgeTop: { icon: ShieldCheck, label: "Dedicated IPs", sublabel: "5 included", tone: "orange" },
    badgeBottom: { icon: ArrowUpRight, label: "Full root", sublabel: "Access, always", tone: "emerald" },
  },
  mail: {
    statusLabel: "Inbox syncing",
    metricLabel: "Spam & malware caught",
    metricValue: "99.7%",
    barValues: [40, 55, 48, 66, 60, 75, 88],
    stats: [
      { icon: Inbox, value: "25GB", label: "Mailbox storage" },
      { icon: Mail, value: "IMAP/POP", label: "Any client, any device" },
    ],
    badgeTop: { icon: ShieldCheck, label: "Your domain", sublabel: "you@yourbusiness.com", tone: "orange" },
    badgeBottom: { icon: ArrowUpRight, label: "Priority", sublabel: "Support included", tone: "emerald" },
  },
  domain: {
    statusLabel: "Domain active",
    metricLabel: "Propagation time",
    metricValue: "< 24 hrs",
    barValues: [42, 50, 46, 64, 58, 72, 85],
    stats: [
      { icon: Globe2, value: ".com/.in", label: "Most popular TLDs" },
      { icon: Lock, value: "Free", label: "WHOIS privacy" },
    ],
    badgeTop: { icon: ShieldCheck, label: "Auto-renewal", sublabel: "Never lose your domain", tone: "orange" },
    badgeBottom: { icon: ArrowUpRight, label: "Free", sublabel: "Domain forwarding", tone: "emerald" },
  },
  affiliate: {
    statusLabel: "Earnings growing",
    metricLabel: "Recurring commission",
    metricValue: "20%",
    barValues: [30, 45, 40, 60, 55, 78, 92],
    stats: [
      { icon: TrendingUp, value: "90 days", label: "Cookie window" },
      { icon: HeartHandshake, value: "₹2,000", label: "Min. withdrawal" },
    ],
    badgeTop: { icon: ShieldCheck, label: "< 7%", sublabel: "Customer churn", tone: "orange" },
    badgeBottom: { icon: ArrowUpRight, label: "Monthly", sublabel: "Payouts", tone: "emerald" },
  },
}

export function HeroVisual({ variant = "dashboard" }: { variant?: HeroVisualVariant }) {
  const config = VARIANTS[variant]

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-brand-orange/25 via-brand-cta-secondary/10 to-transparent blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-navy-dark/90 p-6 shadow-2xl shadow-brand-navy/30 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            {config.statusLabel}
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/50 uppercase">{config.metricLabel}</p>
            <p className="mt-1 font-heading text-4xl font-bold text-white">{config.metricValue}</p>
          </div>
          <div className="flex items-end gap-1.5">
            {config.barValues.map((height, index) => (
              <span
                key={index}
                className="w-2 rounded-full bg-gradient-to-t from-brand-orange to-amber-300"
                style={{ height: `${height * 0.4}px` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
          {config.stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-orange">
                <stat.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{stat.value}</p>
                <p className="text-[11px] text-white/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-6 -top-6 flex items-center gap-2 rounded-2xl border border-border-alt bg-background px-4 py-3 shadow-xl sm:-right-10">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          <config.badgeTop.icon className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-brand-navy">{config.badgeTop.label}</p>
          <p className="text-[11px] text-muted-foreground">{config.badgeTop.sublabel}</p>
        </div>
      </div>

      <div className="absolute -bottom-10 -left-6 flex items-center gap-2 rounded-2xl border border-border-alt bg-background px-4 py-3 shadow-xl sm:-left-12">
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <config.badgeBottom.icon className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-brand-navy">{config.badgeBottom.label}</p>
          <p className="text-[11px] text-muted-foreground">{config.badgeBottom.sublabel}</p>
        </div>
      </div>
    </div>
  )
}
