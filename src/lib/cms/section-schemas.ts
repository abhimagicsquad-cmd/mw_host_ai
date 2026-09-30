import { iconOptions } from "@/sanity/lib/icon-options"

import type { SectionType } from "./types"

/**
 * Declarative field definitions for every page-builder block. The admin section editor
 * renders its form from these, so adding a block means: add a case to
 * src/components/sanity/page-builder.tsx, then describe its fields here.
 */
export type FieldDef =
  | { kind: "text"; name: string; label: string; required?: boolean; placeholder?: string; help?: string }
  | { kind: "textarea"; name: string; label: string; required?: boolean; rows?: number; help?: string }
  | { kind: "markdown"; name: string; label: string; required?: boolean; help?: string }
  | { kind: "number"; name: string; label: string; min?: number; max?: number }
  | { kind: "boolean"; name: string; label: string; help?: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "icon"; name: string; label: string }
  | { kind: "image"; name: string; label: string }
  | { kind: "stringList"; name: string; label: string; help?: string }
  | { kind: "cta"; name: string; label: string }
  | { kind: "objectList"; name: string; label: string; itemLabel: string; fields: FieldDef[]; help?: string }
  /** A nested group of fields stored as one object, e.g. a template's optional "headings & buttons". */
  | { kind: "object"; name: string; label: string; fields: FieldDef[]; help?: string; collapsed?: boolean }

export type SectionSchema = {
  type: SectionType
  label: string
  description: string
  /** Category shown in the "Add section" picker. */
  group: "Hero" | "Content" | "Conversion" | "Social proof"
  fields: FieldDef[]
  defaults: Record<string, unknown>
}

const backgroundOptions = [
  { value: "default", label: "Default" },
  { value: "alt", label: "Light grey" },
  { value: "navy", label: "Navy" },
]

const statFields: FieldDef[] = [
  { kind: "text", name: "label", label: "Label", required: true },
  { kind: "text", name: "value", label: "Value", required: true },
  { kind: "icon", name: "icon", label: "Icon" },
]

const featureFields: FieldDef[] = [
  { kind: "text", name: "title", label: "Title", required: true },
  { kind: "textarea", name: "description", label: "Description", rows: 2 },
  { kind: "icon", name: "icon", label: "Icon" },
]

export const ICON_NAMES = [...new Set(iconOptions)] as string[]

export const sectionSchemas: SectionSchema[] = [
  {
    type: "heroBlock",
    label: "Hero",
    description: "Large homepage-style hero with bullets, CTAs and stats.",
    group: "Hero",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "text", name: "highlightText", label: "Highlighted words", help: "Part of the heading to show in the brand gradient." },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "stringList", name: "bullets", label: "Bullet points", help: "One per line." },
      { kind: "cta", name: "primaryCta", label: "Primary button" },
      { kind: "cta", name: "secondaryCta", label: "Secondary button" },
      { kind: "objectList", name: "stats", label: "Stats", itemLabel: "Stat", fields: statFields },
      { kind: "boolean", name: "showDashboardVisual", label: "Show dashboard illustration" },
    ],
    defaults: { title: "New hero heading", bullets: [], stats: [], showDashboardVisual: true },
  },
  {
    type: "pageHeroBlock",
    label: "Page header",
    description: "Compact inner-page header with breadcrumbs.",
    group: "Hero",
    fields: [
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      {
        kind: "objectList",
        name: "breadcrumbs",
        label: "Breadcrumbs",
        itemLabel: "Crumb",
        fields: [
          { kind: "text", name: "label", label: "Label", required: true },
          { kind: "text", name: "href", label: "Link", placeholder: "/hosting" },
        ],
      },
      { kind: "select", name: "background", label: "Background", options: [{ value: "navy", label: "Navy" }, { value: "alt", label: "Light grey" }] },
    ],
    defaults: { title: "Page title", breadcrumbs: [{ label: "Home", href: "/" }], background: "navy" },
  },
  {
    type: "bannerBlock",
    label: "Announcement banner",
    description: "Thin promo strip at the top of the page.",
    group: "Conversion",
    fields: [
      { kind: "text", name: "message", label: "Message", required: true },
      { kind: "cta", name: "cta", label: "Link" },
      { kind: "boolean", name: "dismissible", label: "Visitors can dismiss it" },
    ],
    defaults: { message: "Limited-time offer", dismissible: true },
  },
  {
    type: "statsBlock",
    label: "Stats",
    description: "Row of headline numbers.",
    group: "Social proof",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "objectList", name: "stats", label: "Stats", itemLabel: "Stat", fields: statFields },
    ],
    defaults: { title: "By the numbers", stats: [] },
  },
  {
    type: "pricingBlock",
    label: "Pricing plans",
    description: "Pricing cards (#pricing anchor).",
    group: "Conversion",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      {
        kind: "select",
        name: "service",
        label: "Show plans from Pricing Plans",
        options: [
          { value: "shared-hosting", label: "Shared hosting" },
          { value: "vps-hosting", label: "VPS hosting" },
          { value: "dedicated-server", label: "Dedicated server" },
          { value: "ssl", label: "SSL certificates" },
          { value: "business-email", label: "Business email" },
          { value: "enterprise-email", label: "Enterprise email" },
        ],
      },
      {
        kind: "objectList",
        name: "plans",
        label: "Custom plans (only used when no service is selected above)",
        itemLabel: "Plan",
        fields: [
          { kind: "text", name: "name", label: "Plan name", required: true },
          { kind: "text", name: "slug", label: "Slug", required: true, help: "Used by /order/[slug]." },
          { kind: "text", name: "price", label: "Price", required: true, placeholder: "₹99" },
          { kind: "text", name: "regularPrice", label: "Regular price (struck through)" },
          { kind: "text", name: "priceSuffix", label: "Price suffix", placeholder: "/mo" },
          { kind: "text", name: "billingLabel", label: "Billing label" },
          { kind: "text", name: "discountLabel", label: "Discount badge" },
          { kind: "textarea", name: "description", label: "Description", rows: 2 },
          { kind: "stringList", name: "features", label: "Features", help: "One per line." },
          { kind: "cta", name: "cta", label: "Button" },
          { kind: "boolean", name: "featured", label: "Highlight as most popular" },
          { kind: "text", name: "service", label: "Service key", placeholder: "shared-hosting" },
        ],
      },
    ],
    defaults: { title: "Choose your plan", plans: [] },
  },
  {
    type: "trustHighlightsBlock",
    label: "Trust highlights",
    description: "Icon grid of guarantees.",
    group: "Social proof",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "select", name: "background", label: "Background", options: backgroundOptions },
      { kind: "objectList", name: "highlights", label: "Highlights", itemLabel: "Highlight", fields: featureFields },
    ],
    defaults: { title: "Why customers trust us", background: "alt", highlights: [] },
  },
  {
    type: "serviceGridBlock",
    label: "Service cards",
    description: "Grid of linked service cards with prices.",
    group: "Content",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      {
        kind: "objectList",
        name: "services",
        label: "Services",
        itemLabel: "Service",
        fields: [
          { kind: "text", name: "title", label: "Title", required: true },
          { kind: "textarea", name: "description", label: "Description", rows: 2 },
          { kind: "icon", name: "icon", label: "Icon" },
          { kind: "text", name: "href", label: "Link", required: true, placeholder: "/vps-hosting" },
          { kind: "text", name: "price", label: "Price" },
          { kind: "text", name: "priceSuffix", label: "Price suffix" },
          { kind: "boolean", name: "featured", label: "Featured" },
        ],
      },
      { kind: "text", name: "ctaLabel", label: "Lead button label", help: "Leave empty to hide the button." },
      { kind: "text", name: "ctaDialogTitle", label: "Lead dialog title" },
      { kind: "text", name: "ctaDialogDescription", label: "Lead dialog description" },
    ],
    defaults: { title: "Our services", services: [] },
  },
  {
    type: "aboutCredibilityBlock",
    label: "About / credibility",
    description: "Text with bullets, CTA and a stats panel.",
    group: "Content",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "stringList", name: "bullets", label: "Bullet points", help: "One per line." },
      { kind: "cta", name: "cta", label: "Button" },
      { kind: "objectList", name: "highlights", label: "Stats", itemLabel: "Stat", fields: statFields },
    ],
    defaults: { title: "About us", bullets: [], highlights: [] },
  },
  {
    type: "featureGridBlock",
    label: "Features",
    description: "Feature grid or 'why choose us' cards.",
    group: "Content",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "select", name: "variant", label: "Style", options: [{ value: "grid", label: "Grid" }, { value: "cards", label: "Cards" }] },
      { kind: "select", name: "columns", label: "Columns", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
      { kind: "select", name: "background", label: "Background", options: [{ value: "none", label: "Default" }, { value: "alt", label: "Light grey" }] },
      { kind: "objectList", name: "items", label: "Features", itemLabel: "Feature", fields: featureFields },
    ],
    defaults: { title: "Features", variant: "grid", columns: 3, background: "none", items: [] },
  },
  {
    type: "testimonialsBlock",
    label: "Testimonials",
    description: "Customer quotes carousel.",
    group: "Social proof",
    fields: [
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      {
        kind: "objectList",
        name: "testimonials",
        label: "Testimonials",
        itemLabel: "Testimonial",
        fields: [
          { kind: "text", name: "name", label: "Name", required: true },
          { kind: "text", name: "role", label: "Role" },
          { kind: "text", name: "company", label: "Company" },
          { kind: "textarea", name: "quote", label: "Quote", required: true },
          { kind: "number", name: "rating", label: "Rating (1–5)", min: 1, max: 5 },
          { kind: "image", name: "avatarUrl", label: "Avatar" },
        ],
      },
      { kind: "text", name: "ctaLabel", label: "Lead button label" },
    ],
    defaults: { title: "What our customers say", testimonials: [] },
  },
  {
    type: "faqBlock",
    label: "FAQ",
    description: "Accordion of questions and answers.",
    group: "Content",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "boolean", name: "contactCta", label: "Show 'still have questions' contact card" },
      {
        kind: "objectList",
        name: "faqs",
        label: "Questions",
        itemLabel: "Question",
        fields: [
          { kind: "text", name: "question", label: "Question", required: true },
          { kind: "textarea", name: "answer", label: "Answer", required: true },
        ],
      },
    ],
    defaults: { title: "Frequently asked questions", contactCta: true, faqs: [] },
  },
  {
    type: "ctaBannerBlock",
    label: "Call to action",
    description: "Full-width CTA band with up to two buttons.",
    group: "Conversion",
    fields: [
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "cta", name: "primaryCta", label: "Primary button" },
      { kind: "cta", name: "secondaryCta", label: "Secondary button" },
      { kind: "select", name: "background", label: "Background", options: backgroundOptions },
    ],
    defaults: { title: "Ready to get started?", primaryCta: { label: "Get started", href: "#lead" }, background: "navy" },
  },
  {
    type: "richTextBlock",
    label: "Rich text",
    description: "Free-form headings, paragraphs and lists.",
    group: "Content",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading" },
      {
        kind: "markdown",
        name: "content",
        label: "Content",
        required: true,
        help: "Blank line = new paragraph. Start a line with ## or ### for headings, - for bullets, 1. for numbered lists. **bold**, *italic*, [link](https://…).",
      },
    ],
    defaults: { content: "" },
  },
  {
    type: "tldPricingBlock",
    label: "Domain prices strip",
    description: "Row of domain extensions with their yearly prices.",
    group: "Conversion",
    fields: [
      {
        kind: "objectList",
        name: "items",
        label: "Domain extensions",
        itemLabel: "Extension",
        fields: [
          { kind: "text", name: "tld", label: "Extension", required: true, placeholder: ".com" },
          { kind: "text", name: "price", label: "Price", required: true, placeholder: "₹1,099" },
          { kind: "text", name: "suffix", label: "Suffix", placeholder: "/yr" },
        ],
      },
    ],
    defaults: { items: [{ tld: ".com", price: "", suffix: "/yr" }] },
  },
  {
    type: "leadFormBlock",
    label: "Contact form",
    description: "Heading plus the short enquiry form (name, email, phone, message).",
    group: "Conversion",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "text", name: "submitLabel", label: "Button label", placeholder: "Send message" },
      { kind: "text", name: "source", label: "Lead source tag", help: "Shown on each lead under Forms → Leads so you know which form it came from." },
      { kind: "select", name: "background", label: "Background", options: [{ value: "none", label: "Default" }, { value: "alt", label: "Light grey" }] },
    ],
    defaults: { title: "Send us your details", submitLabel: "Send message", source: "contact-page" },
  },
  {
    type: "quoteFormBlock",
    label: "Quote request form",
    description: "Heading plus the detailed quote form (service, hosting type, requirements).",
    group: "Conversion",
    fields: [
      { kind: "text", name: "eyebrow", label: "Eyebrow" },
      { kind: "text", name: "title", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Paragraph" },
      { kind: "text", name: "defaultService", label: "Pre-selected service", placeholder: "shared-hosting", help: "Optional service value the form starts with." },
      { kind: "text", name: "source", label: "Lead source tag" },
      { kind: "select", name: "background", label: "Background", options: [{ value: "alt", label: "Light grey" }, { value: "none", label: "Default" }] },
      { kind: "image", name: "imageUrl", label: "Side image" },
      { kind: "text", name: "imageAlt", label: "Side image alt text", help: "Describes the image for screen readers. Leave the image empty to show the default hosting image." },
    ],
    defaults: { title: "Request a detailed quote", background: "alt", source: "page-builder:quote" },
  },
]

export const sectionSchemaMap = Object.fromEntries(sectionSchemas.map((schema) => [schema.type, schema])) as Record<
  SectionType,
  SectionSchema
>

export function isSectionType(value: string): value is SectionType {
  return value in sectionSchemaMap
}

/** Short human summary of a section's content for list views. */
export function summarizeSection(type: SectionType, data: Record<string, unknown>): string {
  const candidate = data.title ?? data.message ?? data.eyebrow
  if (typeof candidate === "string" && candidate.trim()) return candidate
  return sectionSchemaMap[type]?.label ?? type
}
