import { defineArrayMember, defineField, defineType } from "sanity"

export const pricingBlock = defineType({
  name: "pricingBlock",
  title: "Pricing section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "plans",
      title: "Plans",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "pricingPlan" }] })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
