import { Check } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PricingPlan } from "@/types/content"

type PricingCardProps = {
  plan: PricingPlan
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 rounded-2xl border p-6",
        plan.featured ? "border-brand-orange bg-white shadow-xl" : "border-border-alt bg-background"
      )}
    >
      {plan.featured ? (
        <Badge className="absolute -top-3 right-6 bg-brand-orange text-white">Most popular</Badge>
      ) : null}

      <div>
        <p className="font-heading text-sm font-bold tracking-wide text-brand-navy uppercase">{plan.name}</p>
        {plan.description ? <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p> : null}
      </div>

      <div className="flex items-end gap-2">
        <span className="font-heading text-3xl font-bold text-brand-navy">{plan.price}</span>
        {plan.priceSuffix ? <span className="text-sm text-muted-foreground">{plan.priceSuffix}</span> : null}
      </div>
      {plan.regularPrice ? (
        <p className="text-sm text-muted-foreground">
          <span className="line-through">{plan.regularPrice}</span>
          {plan.discountLabel ? <span className="ml-2 text-brand-orange">{plan.discountLabel}</span> : null}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-body-text">
            <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" />
            {feature}
          </li>
        ))}
      </ul>

      <CTAButton
        href={plan.cta.href}
        external={plan.cta.external}
        variant={plan.featured ? "primary" : "outline"}
        className="mt-auto w-full justify-center"
      >
        {plan.cta.label}
      </CTAButton>
    </div>
  )
}
