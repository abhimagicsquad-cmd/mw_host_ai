import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { PricingCard } from "@/components/sections/pricing-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PricingPlan } from "@/types/content"

type PricingTab = {
  value: string
  label: string
  plans: PricingPlan[]
}

type PricingSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  plans?: PricingPlan[]
  tabs?: PricingTab[]
  background?: "none" | "alt"
}

function PricingGrid({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan, index) => (
        <Reveal key={plan.slug} delay={index * 0.06} className="h-full">
          <PricingCard plan={plan} />
        </Reveal>
      ))}
    </div>
  )
}

export function PricingSection({ eyebrow, title, description, plans, tabs, background = "none" }: PricingSectionProps) {
  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      {tabs?.length ? (
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          <TabsList className="mx-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <PricingGrid plans={tab.plans} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <PricingGrid plans={plans ?? []} />
      )}
    </SectionContainer>
  )
}
