import { defineArrayMember, defineField, defineType } from "sanity"

export const pricingPlan = defineType({
  name: "pricingPlan",
  title: "Pricing Plan",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "price", title: "Price", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "regularPrice", title: "Regular price (struck through)", type: "string" }),
    defineField({ name: "priceSuffix", title: "Price suffix", type: "string", description: "e.g. /mo, /yr" }),
    defineField({ name: "billingLabel", title: "Billing label", type: "string" }),
    defineField({ name: "discountLabel", title: "Discount label", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "cta", title: "CTA", type: "ctaLink" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({
      name: "service",
      title: "Service key",
      type: "string",
      description: "Matches a value in src/constants/service-options.ts — pre-selects this service in the lead form.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "price" },
  },
})
