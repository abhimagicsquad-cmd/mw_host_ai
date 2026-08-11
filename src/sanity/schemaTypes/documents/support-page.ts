import { defineArrayMember, defineField, defineType } from "sanity"

export const supportPage = defineType({
  name: "supportPage",
  title: "Support Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Support", validation: (rule) => rule.required() }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "heroDescription", title: "Hero description", type: "text", rows: 2 }),
    defineField({
      name: "channels",
      title: "Support channels",
      type: "array",
      of: [defineArrayMember({ type: "supportChannel" })],
      validation: (rule) => rule.required().min(1),
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
    select: { title: "title" },
  },
})
