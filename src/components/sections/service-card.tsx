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
        "group flex flex-col gap-4 rounded-2xl border p-6 transition-shadow hover:shadow-lg",
        service.featured ? "border-brand-orange bg-brand-orange/5" : "border-border-alt bg-background"
      )}
    >
      <div className="flex items-start justify-between">
        {service.icon ? <IconBadge icon={service.icon} /> : null}
        {service.featured ? <Badge className="bg-brand-orange text-white">Popular</Badge> : null}
      </div>
      <div>
        <p className="font-heading text-lg font-semibold text-brand-navy">{service.title}</p>
        <p className="mt-1.5 text-sm text-body-text">{service.description}</p>
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
