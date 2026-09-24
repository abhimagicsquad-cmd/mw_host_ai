import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { OrderFlow } from "@/components/checkout/order-flow"
import { SectionContainer } from "@/components/layout/section-container"
import { getPricingPlanBySlug } from "@/constants/pricing-plans"
import { buildMetadata } from "@/lib/seo"

type OrderPageProps = {
  params: Promise<{ planSlug: string }>
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { planSlug } = await params
  const plan = getPricingPlanBySlug(planSlug)
  if (!plan) return {}

  return buildMetadata({
    title: `Order ${plan.name}`,
    description: `Complete your ${plan.name} order — test-mode checkout, no live charge is made.`,
    path: `/order/${planSlug}`,
    noIndex: true,
  })
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { planSlug } = await params
  const plan = getPricingPlanBySlug(planSlug)

  if (!plan) notFound()

  return (
    <SectionContainer width="wide" background="alt" className="min-h-[70vh]">
      <div className="mx-auto mb-8 max-w-5xl text-center">
        <p className="text-sm font-bold tracking-wide text-brand-orange uppercase">Checkout</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-navy sm:text-3xl">Set up your {plan.name} plan</h1>
      </div>
      <Suspense>
        <OrderFlow plan={plan} />
      </Suspense>
    </SectionContainer>
  )
}
