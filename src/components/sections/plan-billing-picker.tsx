"use client"

import { useId, useState } from "react"

import { CTAButton } from "@/components/common/cta-button"
import type { PlanBillingChoice } from "@/lib/billing"

type PlanBillingPickerProps = {
  planName: string
  choices: PlanBillingChoice[]
  ctaLabel: string
  featured?: boolean
}

const choiceLabel = (choice: PlanBillingChoice) => `${choice.label} @ ${choice.total}${choice.save ? ` (Save ${choice.save})` : ""}`

/**
 * Billing-period dropdown + Buy button for a plan card — the WordPress cards' "1 Year @ Rs. 2124/-
 * (Save 15%)" selector, where the Buy button follows the chosen period's WHMCS cart link.
 * A single-period plan shows its total instead of a dropdown.
 */
export function PlanBillingPicker({ planName, choices, ctaLabel, featured }: PlanBillingPickerProps) {
  const selectId = useId()
  const [selected, setSelected] = useState(() => Math.max(0, choices.findIndex((choice) => choice.isDefault)))
  const choice = choices[selected] ?? choices[0]

  return (
    <div className="mt-auto flex flex-col gap-3">
      {choices.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={selectId} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Billing period
            </label>
            {choice.save ? <span className="text-xs font-semibold text-brand-orange">Save {choice.save}</span> : null}
          </div>
          <select
            id={selectId}
            value={selected}
            onChange={(event) => setSelected(Number(event.target.value))}
            className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm text-brand-navy outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {choices.map((option, index) => (
              <option key={option.cycle} value={index}>
                {option.label} @ {option.total}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-sm text-body-text">
          <span className="font-semibold text-brand-navy">{choice.total}</span> billed for {choice.label.toLowerCase()}
          {choice.save ? <span className="ml-1 text-brand-orange">(Save {choice.save})</span> : null}
        </p>
      )}

      <CTAButton
        href={choice.href}
        variant={featured ? "primary" : "outline"}
        className="w-full justify-center"
      >
        {ctaLabel}
        <span className="sr-only">
          {" "}
          {planName}, {choiceLabel(choice)}
        </span>
      </CTAButton>
    </div>
  )
}
