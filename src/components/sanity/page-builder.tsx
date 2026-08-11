import type { ReactNode } from "react"
import { PortableText } from "@portabletext/react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { AboutCredibilitySection } from "@/components/sections/about-credibility-section"
import { BannerSection } from "@/components/sections/banner-section"
import { ContentSection } from "@/components/sections/content-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PageHero } from "@/components/sections/page-hero"
import { PricingSection } from "@/components/sections/pricing-section"
import { ServiceGrid } from "@/components/sections/service-grid"
import { StatsSection } from "@/components/sections/stats-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { TrustHighlights } from "@/components/sections/trust-highlights"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { resolveIcon } from "@/lib/icon-map"
import { urlForImage } from "@/sanity/lib/image"
import type {
  FeatureItemData,
  PageBuilderBlock,
  PricingPlanData,
  ServiceCardData,
  StatItemData,
  TestimonialData,
} from "@/sanity/types"
import type { CTA, Feature, PricingPlan, ServiceItem, Stat, Testimonial } from "@/types/content"

/** Renders `title` as plain text, unless `highlightText` names a substring to wrap in the brand gradient span (e.g. "10X faster"). */
function renderHeroTitle(title: string, highlightText?: string): ReactNode {
  if (!highlightText) return title
  const parts = title.split(highlightText)
  if (parts.length !== 2) return title
  return (
    <>
      {parts[0]}
      <span className="text-gradient-brand">{highlightText}</span>
      {parts[1]}
    </>
  )
}

function toCta(cta?: { label: string; href: string; external?: boolean }): CTA | undefined {
  if (!cta) return undefined
  return { label: cta.label, href: cta.href, external: cta.external }
}

function toStat(stat: StatItemData): Stat {
  return { label: stat.label, value: stat.value, icon: resolveIcon(stat.icon) }
}

function toFeature(feature: FeatureItemData): Feature {
  return { title: feature.title, description: feature.description ?? "", icon: resolveIcon(feature.icon) }
}

function toPricingPlan(plan: PricingPlanData): PricingPlan {
  return {
    slug: plan.slug,
    name: plan.name,
    price: plan.price,
    regularPrice: plan.regularPrice,
    priceSuffix: plan.priceSuffix,
    billingLabel: plan.billingLabel,
    discountLabel: plan.discountLabel,
    description: plan.description,
    features: plan.features ?? [],
    cta: toCta(plan.cta) ?? { label: "Get started", href: "#lead" },
    featured: plan.featured,
    service: plan.service,
  }
}

function toServiceItem(card: ServiceCardData, index: number): ServiceItem {
  return {
    slug: card.href.replace(/^\/+/, "").replace(/\//g, "-") || `service-${index}`,
    title: card.title,
    description: card.description ?? "",
    icon: resolveIcon(card.icon),
    href: card.href,
    price: card.price,
    priceSuffix: card.priceSuffix,
    featured: card.featured,
  }
}

function toTestimonial(testimonial: TestimonialData): Testimonial {
  return {
    name: testimonial.name,
    title: testimonial.role,
    company: testimonial.company,
    quote: testimonial.quote,
    avatarUrl: urlForImage(testimonial.avatar)?.width(96).height(96).url(),
    rating: testimonial.rating,
  }
}

/** Renders the CMS-authored `pageBuilder` array by mapping each block to its existing section component — add a case here when a new block type is added to `sanity/schemaTypes/objects/page-builder.ts`. */
export function PageBuilder({ blocks }: { blocks: PageBuilderBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case "heroBlock":
            return (
              <HeroSection
                key={block._key}
                eyebrow={block.eyebrow}
                title={renderHeroTitle(block.title, block.highlightText)}
                description={block.description}
                bullets={block.bullets}
                primaryCta={toCta(block.primaryCta)}
                secondaryCta={toCta(block.secondaryCta)}
                stats={block.stats?.map(toStat)}
                media={block.showDashboardVisual ? <HeroVisual /> : undefined}
              />
            )
          case "pageHeroBlock":
            return (
              <PageHero
                key={block._key}
                title={block.title}
                description={block.description}
                breadcrumbs={block.breadcrumbs}
                background={block.background === "alt" ? "alt" : "navy"}
              />
            )
          case "bannerBlock":
            return (
              <BannerSection
                key={block._key}
                message={block.message}
                cta={toCta(block.cta)}
                dismissible={block.dismissible}
              />
            )
          case "statsBlock":
            return (
              <StatsSection
                key={block._key}
                eyebrow={block.eyebrow}
                title={block.title}
                description={block.description}
                stats={block.stats.map(toStat)}
              />
            )
          case "pricingBlock":
            return (
              <div key={block._key} id="pricing">
                <PricingSection
                  eyebrow={block.eyebrow}
                  title={block.title}
                  description={block.description}
                  plans={block.plans.map(toPricingPlan)}
                />
              </div>
            )
          case "trustHighlightsBlock":
            return (
              <TrustHighlights
                key={block._key}
                eyebrow={block.eyebrow}
                title={block.title}
                description={block.description}
                background={block.background === "default" ? "none" : block.background}
                highlights={block.highlights.map((h) => ({ ...toFeature(h), icon: resolveIcon(h.icon) ?? toFeature(h).icon! }))}
              />
            )
          case "serviceGridBlock":
            return (
              <ServiceGrid
                key={block._key}
                eyebrow={block.eyebrow}
                title={block.title}
                description={block.description}
                services={block.services.map(toServiceItem)}
                cta={
                  block.ctaLabel ? (
                    <LeadCTAButton
                      source="services"
                      variant="outline"
                      dialogTitle={block.ctaDialogTitle}
                      dialogDescription={block.ctaDialogDescription}
                    >
                      {block.ctaLabel}
                    </LeadCTAButton>
                  ) : undefined
                }
              />
            )
          case "aboutCredibilityBlock":
            return (
              <AboutCredibilitySection
                key={block._key}
                eyebrow={block.eyebrow}
                title={block.title}
                description={block.description}
                bullets={block.bullets}
                cta={toCta(block.cta)}
                highlights={block.highlights?.map(toStat) ?? []}
              />
            )
          case "featureGridBlock": {
            const items = block.items.map(toFeature)
            if (block.variant === "cards") {
              return (
                <WhyChooseUs
                  key={block._key}
                  eyebrow={block.eyebrow}
                  title={block.title}
                  description={block.description}
                  background={block.background === "alt" ? "alt" : "none"}
                  reasons={items}
                />
              )
            }
            return (
              <FeaturesSection
                key={block._key}
                eyebrow={block.eyebrow}
                title={block.title}
                description={block.description}
                columns={block.columns ?? 3}
                background={block.background === "alt" ? "alt" : "none"}
                features={items}
              />
            )
          }
          case "testimonialsBlock":
            return (
              <TestimonialsSection
                key={block._key}
                title={block.title}
                description={block.description}
                testimonials={block.testimonials.map(toTestimonial)}
                cta={
                  block.ctaLabel ? (
                    <LeadCTAButton source="testimonials" variant="outline">
                      {block.ctaLabel}
                    </LeadCTAButton>
                  ) : undefined
                }
              />
            )
          case "faqBlock":
            return (
              <FAQSection
                key={block._key}
                eyebrow={block.eyebrow}
                title={block.title}
                description={block.description}
                contactCta={block.contactCta}
                items={block.faqs}
              />
            )
          case "ctaBannerBlock":
            return (
              <CTASection
                key={block._key}
                title={block.title}
                description={block.description}
                primaryCta={toCta(block.primaryCta) ?? { label: "Learn more", href: "#lead" }}
                secondaryCta={toCta(block.secondaryCta)}
                background={block.background === "default" ? "alt" : block.background}
              />
            )
          case "richTextBlock":
            return (
              <ContentSection key={block._key} eyebrow={block.eyebrow} title={block.title}>
                <PortableText value={block.content} />
              </ContentSection>
            )
          default:
            return null
        }
      })}
    </>
  )
}
