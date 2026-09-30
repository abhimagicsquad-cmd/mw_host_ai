import { Check } from "lucide-react"

import { CTAOrLeadButton } from "@/components/common/cta-or-lead-button"
import { Badge } from "@/components/ui/badge"
import { PlanBillingPicker } from "@/components/sections/plan-billing-picker"
import { planBillingChoices, planPurchaseCta } from "@/lib/billing"
import { cn } from "@/lib/utils"
import type { PricingPlan } from "@/types/content"

type PricingCardProps = {
  plan: PricingPlan
}

export function PricingCard({ plan }: PricingCardProps) {
  const cta = planPurchaseCta(plan)
  const billingChoices = planBillingChoices(plan.slug)
  // The headline price is the default period's rate, so its saving is the discount shown
  // (e.g. "Save 30% on 3 Years", as on WordPress) rather than a free-text CMS label.
  const defaultChoice = billingChoices?.find((choice) => choice.isDefault)
  const discountLabel = defaultChoice?.save && billingChoices!.length > 1 ? `Save ${defaultChoice.save} on ${defaultChoice.label}` : plan.discountLabel

  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-5 rounded-2xl border p-6 transition-all",
        plan.featured
          ? "border-brand-orange bg-white shadow-xl shadow-brand-orange/10 lg:-translate-y-2"
          : "border-border-alt bg-background hover:-translate-y-1 hover:border-brand-navy/20 hover:shadow-lg"
      )}
    >
      {plan.featured ? (
        <Badge className="absolute -top-3 right-6 bg-brand-orange text-white">Most popular</Badge>
      ) : null}

      <div>
        <p className="text-sm font-bold tracking-wide text-brand-navy uppercase">{plan.name}</p>
        {plan.description ? <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p> : null}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-brand-navy">{plan.price}</span>
        {plan.priceSuffix ? <span className="text-sm text-muted-foreground">{plan.priceSuffix}</span> : null}
      </div>
      {plan.regularPrice ? (
        <p className="text-sm text-muted-foreground">
          <span className="line-through">{plan.regularPrice}</span>
          {discountLabel ? <span className="ml-2 text-brand-orange">{discountLabel}</span> : null}
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

      {billingChoices ? (
        <PlanBillingPicker planName={plan.name} choices={billingChoices} ctaLabel={cta.label} featured={plan.featured} />
      ) : (
        <CTAOrLeadButton
          cta={cta}
          source={`pricing:${plan.slug}`}
          variant={plan.featured ? "primary" : "outline"}
          className="mt-auto w-full justify-center"
          dialogTitle={`Get started with ${plan.name}`}
          dialogDescription={`Share your details and we'll help you get set up on the ${plan.name} plan.`}
          defaultService={plan.service}
        />
      )}
    </div>
  )
}
