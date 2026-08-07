import { LeadCTAButton } from "@/components/common/lead-cta-button"
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
  contactCta?: boolean
}

export function FAQSection({
  eyebrow = "FAQs",
  title,
  description,
  items,
  background = "none",
  contactCta = true,
}: FAQSectionProps) {
  return (
    <SectionContainer background={background} width="default">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10">
        <FAQAccordion items={items} />
      </div>
      {contactCta ? (
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border-alt pt-8 text-center">
          <p className="text-sm text-body-text">Still have questions? Our team replies within a few hours.</p>
          <LeadCTAButton source="faq" variant="outline" size="sm">
            Contact support
          </LeadCTAButton>
        </div>
      ) : null}
    </SectionContainer>
  )
}
