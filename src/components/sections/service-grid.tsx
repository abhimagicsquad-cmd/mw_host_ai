import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { ServiceCard } from "@/components/sections/service-card"
import type { ServiceItem } from "@/types/content"

type ServiceGridProps = {
  eyebrow?: string
  title: string
  description?: string
  services: ServiceItem[]
  background?: "none" | "alt"
}

export function ServiceGrid({ eyebrow, title, description, services, background = "none" }: ServiceGridProps) {
  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </SectionContainer>
  )
}
