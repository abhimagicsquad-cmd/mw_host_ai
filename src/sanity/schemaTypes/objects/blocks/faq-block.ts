import { defineArrayMember, defineField, defineType } from "sanity"

export const faqBlock = defineType({
  name: "faqBlock",
  title: "FAQ section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "contactCta", title: "Show \"still have questions\" CTA", type: "boolean", initialValue: true }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
