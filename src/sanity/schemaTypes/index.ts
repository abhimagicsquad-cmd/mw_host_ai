import type { SchemaTypeDefinition } from "sanity"

import { aboutCredibilityBlock } from "@/sanity/schemaTypes/objects/blocks/about-credibility-block"
import { bannerBlock } from "@/sanity/schemaTypes/objects/blocks/banner-block"
import { ctaBannerBlock } from "@/sanity/schemaTypes/objects/blocks/cta-banner-block"
import { faqBlock } from "@/sanity/schemaTypes/objects/blocks/faq-block"
import { featureGridBlock } from "@/sanity/schemaTypes/objects/blocks/feature-grid-block"
import { heroBlock } from "@/sanity/schemaTypes/objects/blocks/hero-block"
import { pageHeroBlock } from "@/sanity/schemaTypes/objects/blocks/page-hero-block"
import { pricingBlock } from "@/sanity/schemaTypes/objects/blocks/pricing-block"
import { richTextBlock } from "@/sanity/schemaTypes/objects/blocks/rich-text-block"
import { serviceCard } from "@/sanity/schemaTypes/objects/blocks/service-card"
import { serviceGridBlock } from "@/sanity/schemaTypes/objects/blocks/service-grid-block"
import { statsBlock } from "@/sanity/schemaTypes/objects/blocks/stats-block"
import { testimonialsBlock } from "@/sanity/schemaTypes/objects/blocks/testimonials-block"
import { trustHighlightsBlock } from "@/sanity/schemaTypes/objects/blocks/trust-highlights-block"
import { blockContent } from "@/sanity/schemaTypes/objects/block-content"
import { breadcrumbItem } from "@/sanity/schemaTypes/objects/breadcrumb-item"
import { comparisonRow } from "@/sanity/schemaTypes/objects/comparison-row"
import { ctaLink } from "@/sanity/schemaTypes/objects/cta-link"
import { faqItem } from "@/sanity/schemaTypes/objects/faq-item"
import { featureItem } from "@/sanity/schemaTypes/objects/feature-item"
import { iconCtaLink } from "@/sanity/schemaTypes/objects/icon-cta-link"
import { legalSection } from "@/sanity/schemaTypes/objects/legal-section"
import { navColumn } from "@/sanity/schemaTypes/objects/nav-column"
import { navFeatured } from "@/sanity/schemaTypes/objects/nav-featured"
import { navItem } from "@/sanity/schemaTypes/objects/nav-item"
import { navLink } from "@/sanity/schemaTypes/objects/nav-link"
import { pageBuilder } from "@/sanity/schemaTypes/objects/page-builder"
import { seo } from "@/sanity/schemaTypes/objects/seo"
import { statItem } from "@/sanity/schemaTypes/objects/stat-item"
import { supportChannel } from "@/sanity/schemaTypes/objects/support-channel"

import { aboutPage } from "@/sanity/schemaTypes/documents/about-page"
import { affiliatePage } from "@/sanity/schemaTypes/documents/affiliate-page"
import { author } from "@/sanity/schemaTypes/documents/author"
import { blogListingPage } from "@/sanity/schemaTypes/documents/blog-listing-page"
import { blogPost } from "@/sanity/schemaTypes/documents/blog-post"
import { category } from "@/sanity/schemaTypes/documents/category"
import { comparisonPage } from "@/sanity/schemaTypes/documents/comparison-page"
import { contactPage } from "@/sanity/schemaTypes/documents/contact-page"
import { faq } from "@/sanity/schemaTypes/documents/faq"
import { homePage } from "@/sanity/schemaTypes/documents/home-page"
import { kbArticle } from "@/sanity/schemaTypes/documents/kb-article"
import { kbCategory } from "@/sanity/schemaTypes/documents/kb-category"
import { knowledgeBasePage } from "@/sanity/schemaTypes/documents/knowledge-base-page"
import { legalPage } from "@/sanity/schemaTypes/documents/legal-page"
import { navigation } from "@/sanity/schemaTypes/documents/navigation"
import { pricingPlan } from "@/sanity/schemaTypes/documents/pricing-plan"
import { servicePage } from "@/sanity/schemaTypes/documents/service-page"
import { servicesPage } from "@/sanity/schemaTypes/documents/services-page"
import { siteSettings } from "@/sanity/schemaTypes/documents/site-settings"
import { supportPage } from "@/sanity/schemaTypes/documents/support-page"
import { testimonial } from "@/sanity/schemaTypes/documents/testimonial"
import { thankYouPage } from "@/sanity/schemaTypes/documents/thank-you-page"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects
    seo,
    ctaLink,
    statItem,
    featureItem,
    faqItem,
    legalSection,
    supportChannel,
    comparisonRow,
    iconCtaLink,
    navLink,
    navColumn,
    navFeatured,
    navItem,
    breadcrumbItem,
    blockContent,
    // Page-builder blocks
    heroBlock,
    pageHeroBlock,
    bannerBlock,
    statsBlock,
    pricingBlock,
    trustHighlightsBlock,
    serviceCard,
    serviceGridBlock,
    aboutCredibilityBlock,
    featureGridBlock,
    testimonialsBlock,
    faqBlock,
    ctaBannerBlock,
    richTextBlock,
    pageBuilder,
    // Documents
    siteSettings,
    navigation,
    homePage,
    aboutPage,
    contactPage,
    servicesPage,
    servicePage,
    legalPage,
    supportPage,
    affiliatePage,
    comparisonPage,
    knowledgeBasePage,
    kbCategory,
    kbArticle,
    thankYouPage,
    blogListingPage,
    blogPost,
    author,
    category,
    faq,
    testimonial,
    pricingPlan,
  ],
}
