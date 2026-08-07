import { ArrowUpRight, Gauge, ShieldCheck, Zap } from "lucide-react"

const loadBars = [38, 52, 44, 70, 58, 82, 96]

export function HeroVisual() {
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
            All systems live
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/50 uppercase">Uptime, last 90 days</p>
            <p className="mt-1 font-heading text-4xl font-bold text-white">99.98%</p>
          </div>
          <div className="flex items-end gap-1.5">
            {loadBars.map((height, index) => (
              <span
                key={index}
                className="w-2 rounded-full bg-gradient-to-t from-brand-orange to-amber-300"
                style={{ height: `${height * 0.4}px` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-orange-accessible">
              <Zap className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">0.7s</p>
              <p className="text-[11px] text-white/50">Avg. load time</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-orange-accessible">
              <Gauge className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">NVMe</p>
              <p className="text-[11px] text-white/50">Storage, every plan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-6 -top-6 flex items-center gap-2 rounded-2xl border border-border-alt bg-background px-4 py-3 shadow-xl sm:-right-10">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange-accessible">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-brand-navy">Free SSL</p>
          <p className="text-[11px] text-muted-foreground">On every plan</p>
        </div>
      </div>

      <div className="absolute -bottom-10 -left-6 flex items-center gap-2 rounded-2xl border border-border-alt bg-background px-4 py-3 shadow-xl sm:-left-12">
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <ArrowUpRight className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-brand-navy">12,000+</p>
          <p className="text-[11px] text-muted-foreground">Businesses hosted</p>
        </div>
      </div>
    </div>
  )
}
