import type { SchemaTypeDefinition } from "sanity"

import { aboutCredibilityBlock } from "@/sanity/schemaTypes/objects/blocks/about-credibility-block"
import { bannerBlock } from "@/sanity/schemaTypes/objects/blocks/banner-block"
import { ctaBannerBlock } from "@/sanity/schemaTypes/objects/blocks/cta-banner-block"
import { faqBlock } from "@/sanity/schemaTypes/objects/blocks/faq-block"
import { heroBlock } from "@/sanity/schemaTypes/objects/blocks/hero-block"
import { pricingBlock } from "@/sanity/schemaTypes/objects/blocks/pricing-block"
import { richTextBlock } from "@/sanity/schemaTypes/objects/blocks/rich-text-block"
import { serviceCard } from "@/sanity/schemaTypes/objects/blocks/service-card"
import { serviceGridBlock } from "@/sanity/schemaTypes/objects/blocks/service-grid-block"
import { statsBlock } from "@/sanity/schemaTypes/objects/blocks/stats-block"
import { testimonialsBlock } from "@/sanity/schemaTypes/objects/blocks/testimonials-block"
import { trustHighlightsBlock } from "@/sanity/schemaTypes/objects/blocks/trust-highlights-block"
import { blockContent } from "@/sanity/schemaTypes/objects/block-content"
import { ctaLink } from "@/sanity/schemaTypes/objects/cta-link"
import { faqItem } from "@/sanity/schemaTypes/objects/faq-item"
import { featureItem } from "@/sanity/schemaTypes/objects/feature-item"
import { pageBuilder } from "@/sanity/schemaTypes/objects/page-builder"
import { seo } from "@/sanity/schemaTypes/objects/seo"
import { statItem } from "@/sanity/schemaTypes/objects/stat-item"

import { aboutPage } from "@/sanity/schemaTypes/documents/about-page"
import { author } from "@/sanity/schemaTypes/documents/author"
import { blogListingPage } from "@/sanity/schemaTypes/documents/blog-listing-page"
import { blogPost } from "@/sanity/schemaTypes/documents/blog-post"
import { category } from "@/sanity/schemaTypes/documents/category"
import { contactPage } from "@/sanity/schemaTypes/documents/contact-page"
import { faq } from "@/sanity/schemaTypes/documents/faq"
import { homePage } from "@/sanity/schemaTypes/documents/home-page"
import { pricingPlan } from "@/sanity/schemaTypes/documents/pricing-plan"
import { servicePage } from "@/sanity/schemaTypes/documents/service-page"
import { servicesPage } from "@/sanity/schemaTypes/documents/services-page"
import { siteSettings } from "@/sanity/schemaTypes/documents/site-settings"
import { testimonial } from "@/sanity/schemaTypes/documents/testimonial"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects
    seo,
    ctaLink,
    statItem,
    featureItem,
    faqItem,
    blockContent,
    // Page-builder blocks
    heroBlock,
    bannerBlock,
    statsBlock,
    pricingBlock,
    trustHighlightsBlock,
    serviceCard,
    serviceGridBlock,
    aboutCredibilityBlock,
    testimonialsBlock,
    faqBlock,
    ctaBannerBlock,
    richTextBlock,
    pageBuilder,
    // Documents
    siteSettings,
    homePage,
    aboutPage,
    contactPage,
    servicesPage,
    servicePage,
    blogListingPage,
    blogPost,
    author,
    category,
    faq,
    testimonial,
    pricingPlan,
  ],
}
