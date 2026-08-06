import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { FAQAccordion } from "@/components/sections/faq-accordion"
import type { FAQItem } from "@/types/content"

type FAQSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  items: FAQItem[]
  background?: "none" | "alt"
}

export function FAQSection({ eyebrow = "FAQs", title, description, items, background = "none" }: FAQSectionProps) {
  return (
    <SectionContainer background={background} width="default">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10">
        <FAQAccordion items={items} />
      </div>
    </SectionContainer>
  )
}
