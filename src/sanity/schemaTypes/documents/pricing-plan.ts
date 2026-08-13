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
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Plans within the same service are sorted ascending by this value (tier order, e.g. Starter=1, Basic Plus=2...).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "region",
      title: "Data-center region",
      type: "string",
      description: "For product families sold in both regions (VPS, Dedicated). Leave unset if region-agnostic.",
      options: { list: [{ title: "India", value: "india" }, { title: "USA", value: "usa" }] },
    }),
    defineField({
      name: "billingCycles",
      title: "Multi-year billing cycles",
      description: "Real 1/2/3-year totals for the checkout configure step. Leave empty for monthly-only plans.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "billingCycleOption",
          fields: [
            defineField({
              name: "cycle",
              title: "Cycle",
              type: "string",
              options: {
                list: [
                  { title: "Monthly", value: "monthly" },
                  { title: "Annually (1 year)", value: "annually" },
                  { title: "Biennially (2 years)", value: "biennially" },
                  { title: "Triennially (3 years)", value: "triennially" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "totalPrice", title: "Total price", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "priceSuffix", title: "Price suffix", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "totalPrice" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "price" },
  },
})
