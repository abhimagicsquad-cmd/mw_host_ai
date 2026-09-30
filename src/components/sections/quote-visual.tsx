import { Globe2, Headset, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type FeatureCard = { icon: LucideIcon; label: string; sublabel: string; position: string; delay: string }

const FEATURES: FeatureCard[] = [
  { icon: Globe2, label: "Domain & Hosting", sublabel: "One place, one bill", position: "left-0 top-6 sm:top-10", delay: "" },
  { icon: ShieldCheck, label: "Secure & Reliable", sublabel: "Free SSL, daily backups", position: "right-0 top-1/3", delay: "[animation-delay:-1.5s]" },
  { icon: Headset, label: "Expert Support", sublabel: "Real people, 24/7", position: "left-0 bottom-1/4", delay: "[animation-delay:-3s]" },
  { icon: TrendingUp, label: "Scalable Solutions", sublabel: "Grow without migrating", position: "right-2 bottom-0 sm:right-6", delay: "[animation-delay:-4.5s]" },
]

/** Decorative hosting illustration (cloud → servers → web) with floating feature cards, for the quote section. */
export function QuoteVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-lg py-10 sm:py-12", className)}>
      <div aria-hidden className="absolute inset-8 -z-10 rounded-full bg-gradient-to-br from-brand-orange/20 via-brand-cta-secondary/15 to-transparent blur-3xl" />

      <div className="mx-6 overflow-hidden rounded-3xl border border-white/10 bg-brand-navy-dark shadow-2xl shadow-brand-navy/25 sm:mx-12">
        <HostingIllustration />
      </div>

      <ul className="contents">
        {FEATURES.map((feature) => (
          <li
            key={feature.label}
            className={cn(
              "absolute flex items-center gap-2.5 rounded-2xl border border-border-alt bg-background/95 px-3.5 py-2.5 shadow-xl backdrop-blur motion-safe:animate-float",
              feature.position,
              feature.delay
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
              <feature.icon className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block text-xs font-semibold text-brand-navy dark:text-foreground">{feature.label}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">{feature.sublabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HostingIllustration() {
  const racks = [150, 206, 262]
  return (
    <svg viewBox="0 0 400 400" className="block h-auto w-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id="qv-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#b84300" />
        </linearGradient>
        <linearGradient id="qv-blue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#019ad2" />
          <stop offset="1" stopColor="#33bcef" />
        </linearGradient>
        <linearGradient id="qv-rack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4852" />
          <stop offset="1" stopColor="#2a363f" />
        </linearGradient>
        <pattern id="qv-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" opacity="0.07" />
        </pattern>
      </defs>

      <rect width="400" height="400" fill="url(#qv-grid)" />

      {/* Cloud */}
      <path
        d="M142 104c-19 0-34-14-34-32 0-17 13-30 30-32 5-19 23-32 44-32 21 0 38 12 44 30 3-1 7-1 10-1 22 0 40 16 40 36s-18 31-40 31z"
        fill="none"
        stroke="url(#qv-blue)"
        strokeWidth="4"
        strokeLinejoin="round"
        transform="translate(10 18)"
      />
      <path d="M190 72l12-12 12 12M202 60v28" stroke="#33bcef" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Links from cloud to the rack */}
      <path d="M200 124v22M150 124c0 14-14 16-14 30M250 124c0 14 14 16 14 30" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 5" fill="none" />

      {/* Server rack */}
      {racks.map((y, i) => (
        <g key={y}>
          <rect x="110" y={y} width="180" height="44" rx="10" fill="url(#qv-rack)" stroke="#ffffff" strokeOpacity="0.12" />
          <rect x="126" y={y + 16} width="64" height="4" rx="2" fill="#ffffff" opacity="0.18" />
          <rect x="126" y={y + 25} width="44" height="4" rx="2" fill="#ffffff" opacity="0.1" />
          <circle cx="252" cy={y + 22} r="4.5" fill="#34d399" />
          <circle cx="268" cy={y + 22} r="4.5" fill={i === 1 ? "url(#qv-orange)" : "#34d399"} opacity={i === 1 ? 1 : 0.55} />
        </g>
      ))}

      {/* Globe (domains) */}
      <g transform="translate(78 346)">
        <circle r="30" fill="#1c2329" stroke="url(#qv-blue)" strokeWidth="3" />
        <ellipse rx="13" ry="30" fill="none" stroke="#33bcef" strokeOpacity="0.7" strokeWidth="2" />
        <path d="M-30 0h60M-25-15h50M-25 15h50" stroke="#33bcef" strokeOpacity="0.7" strokeWidth="2" />
      </g>

      {/* Shield (security) */}
      <g transform="translate(322 316)">
        <path d="M0-30l26 10v18c0 18-11 30-26 36C-15 28-26 16-26-2v-18z" fill="url(#qv-orange)" />
        <path d="M-10 2l7 7 14-15" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Links from the rack to the web */}
      <path d="M150 306c0 20-40 16-44 26M250 306c0 12 40 8 48 0" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 5" fill="none" />

      {/* Browser window (websites) */}
      <g transform="translate(150 324)">
        <rect width="100" height="60" rx="8" fill="#ffffff" />
        <rect width="100" height="14" rx="7" fill="#e8e8e8" />
        <circle cx="10" cy="7" r="2.5" fill="#b84300" />
        <circle cx="19" cy="7" r="2.5" fill="#019ad2" />
        <rect x="10" y="22" width="48" height="6" rx="3" fill="#2a363f" />
        <rect x="10" y="33" width="80" height="4" rx="2" fill="#2a363f" opacity="0.2" />
        <rect x="10" y="41" width="64" height="4" rx="2" fill="#2a363f" opacity="0.2" />
        <rect x="64" y="20" width="26" height="10" rx="5" fill="url(#qv-orange)" />
      </g>
    </svg>
  )
}
