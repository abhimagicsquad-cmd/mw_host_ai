import { Reveal } from "@/components/common/reveal"
import Link from "@/components/common/site-link"
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
  // Three per row for 3/6-plan grids (VPS, the six NVMe tiers), as on WordPress; four otherwise;
  // a single plan (e.g. Unlimited Hosting) is centred.
  const columns = plans.length === 1 ? "mx-auto max-w-sm sm:grid-cols-1" : plans.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"
  return (
    <div className={`mt-12 grid gap-6 sm:grid-cols-2 ${columns}`}>
      {plans.map((plan, index) => (
        <Reveal key={plan.slug} delay={index * 0.06} className="h-full">
          <PricingCard plan={plan} />
        </Reveal>
      ))}
    </div>
  )
}

export function PricingSection({ eyebrow, title, description, plans, tabs, background = "none" }: PricingSectionProps) {
  const allPlans = tabs?.length ? tabs.flatMap((tab) => tab.plans) : (plans ?? [])
  // WordPress printed this under every shared-hosting grid ("unlimited" is subject to fair use).
  const showUsageNote = allPlans.some((plan) => plan.service === "shared-hosting")

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

      {showUsageNote ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          * Please see the Unlimited Usage Policy in our{" "}
          <Link href="/legal/resource-abuse-policy" className="font-medium text-brand-orange hover:underline">
            Resource Abuse Policy
          </Link>
          .
        </p>
      ) : null}
    </SectionContainer>
  )
}
