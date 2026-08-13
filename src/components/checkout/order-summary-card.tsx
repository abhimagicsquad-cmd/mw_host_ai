import { ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OrderSummaryCardProps = {
  planName: string
  billingLabel: string
  amount: string
  className?: string
}

export function OrderSummaryCard({ planName, billingLabel, amount, className }: OrderSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium text-brand-navy">{planName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Billing</span>
          <span className="font-medium text-brand-navy">{billingLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border-alt pt-3 text-base">
          <span className="font-medium text-brand-navy">Total due today</span>
          <span className="font-heading text-xl font-bold text-brand-navy">{amount}</span>
        </div>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-orange" />
          Test mode — no real charge will be made.
        </p>
      </CardContent>
    </Card>
  )
}
