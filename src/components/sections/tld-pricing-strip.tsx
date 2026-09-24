import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"

type TldPricingStripProps = {
  items: { tld: string; price: string; suffix: string }[]
}

export function TldPricingStrip({ items }: TldPricingStripProps) {
  return (
    <SectionContainer width="wide" background="alt" className="py-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.tld} delay={index * 0.06}>
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-border-alt bg-background p-5 text-center">
              <p className="text-xl font-bold text-brand-navy">{item.tld}</p>
              <p className="text-sm text-body-text">
                <span className="font-semibold text-brand-orange">{item.price}</span>
                <span className="text-muted-foreground">{item.suffix}</span>
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  )
}
