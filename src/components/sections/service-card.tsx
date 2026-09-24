import { ArrowRight } from "lucide-react"

import { IconBadge } from "@/components/common/icon-badge"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ServiceItem } from "@/types/content"
import Link from "next/link"

type ServiceCardProps = {
  service: ServiceItem
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link
      href={service.href}
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl",
        service.featured
          ? "border-brand-orange/40 bg-gradient-to-b from-brand-orange/8 to-background"
          : "border-border-alt bg-background hover:border-brand-navy/20"
      )}
    >
      <div className="flex items-start justify-between">
        {service.icon ? (
          <IconBadge icon={service.icon} className="transition-transform group-hover:scale-105" />
        ) : null}
        {service.featured ? <Badge className="bg-brand-orange text-white">Popular</Badge> : null}
      </div>
      <div>
        <p className="text-lg font-semibold text-brand-navy">{service.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-body-text">{service.description}</p>
      </div>
      {service.price ? (
        <p className="text-brand-navy">
          <span className="text-2xl font-bold">{service.price}</span>
          {service.priceSuffix ? <span className="text-sm text-muted-foreground">{service.priceSuffix}</span> : null}
        </p>
      ) : null}
      <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-brand-orange">
        Learn more
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
