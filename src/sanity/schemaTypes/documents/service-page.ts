import { defineArrayMember, defineField, defineType } from "sanity"

/**
 * Individual service/product detail pages — covers every family currently driven by
 * src/constants/{hosting,domain,dedicated,email}-pages-data.ts plus the flat ssl/vps-hosting
 * pages. `category` scopes the slug to a route family (e.g. /hosting/[slug], /domain/[slug]).
 */
export const servicePage = defineType({
  name: "servicePage",
  title: "Individual Service Page",
  type: "document",
  fields: [
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["hosting", "domain", "dedicated", "email", "ssl", "vps"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "eyebrow" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "heroDescription", title: "Hero description", type: "text", rows: 3 }),
    defineField({
      name: "bullets",
      title: "Bullets",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
    }),
    defineField({
      name: "managed",
      title: "Managed service",
      type: "boolean",
      description: "Dedicated-server family only.",
    }),
    defineField({
      name: "plan",
      title: "Pricing plan",
      type: "reference",
      to: [{ type: "pricingPlan" }],
      description: "Used when this page has its own single plan (e.g. an email hosting tier) instead of the shared plan grid.",
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "heroTitle", subtitle: "category" },
  },
})
