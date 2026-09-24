import { ArrowLeftRight, Check, Minus } from "lucide-react"

import { CTAOrLeadButton } from "@/components/common/cta-or-lead-button"
import { cn } from "@/lib/utils"
import type { ComparisonRow } from "@/constants/compare-hosting-data"
import type { PricingPlan } from "@/types/content"

type PlanComparisonTableProps = {
  plans: PricingPlan[]
  rows: ComparisonRow[]
}

function renderCellValue(value: string) {
  if (value === "Yes") return <Check className="mx-auto size-4 text-brand-orange" />
  if (value === "No") return <Minus className="mx-auto size-4 text-muted-foreground" />
  return value
}

export function PlanComparisonTable({ plans, rows }: PlanComparisonTableProps) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:hidden">
        <ArrowLeftRight className="size-3.5" />
        Swipe sideways to compare all plans
      </p>
      <div className="relative overflow-x-auto rounded-2xl border border-border-alt">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent sm:hidden" />
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-alt bg-surface-alt">
              <th className="p-4 text-left text-sm font-semibold text-brand-navy">Feature</th>
              {plans.map((plan) => (
                <th
                  key={plan.slug}
                  className={cn(
                    "p-4 text-center text-sm font-semibold",
                    plan.featured ? "bg-brand-orange/10 text-brand-orange" : "text-brand-navy"
                  )}
                >
                  <p>{plan.name}</p>
                  <p className="mt-1 text-base font-bold">
                    {plan.price}
                    <span className="text-xs font-normal text-muted-foreground">{plan.priceSuffix}</span>
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className={cn(index % 2 === 0 ? "bg-background" : "bg-surface-alt/50")}>
                <td className="p-4 font-medium text-brand-navy">{row.label}</td>
                {row.values.map((value, valueIndex) => (
                  <td
                    key={valueIndex}
                    className={cn(
                      "p-4 text-center text-body-text",
                      plans[valueIndex]?.featured && "bg-brand-orange/5 font-medium text-brand-navy"
                    )}
                  >
                    {renderCellValue(value)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border-alt bg-surface-alt">
              <td className="p-4" />
              {plans.map((plan) => (
                <td key={plan.slug} className="p-4 text-center">
                  <CTAOrLeadButton
                    cta={plan.cta}
                    source={`compare:${plan.slug}`}
                    size="sm"
                    variant={plan.featured ? "primary" : "outline"}
                    defaultService={plan.service}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
