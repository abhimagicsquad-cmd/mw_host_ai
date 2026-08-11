import { defineArrayMember, defineField, defineType } from "sanity"

export const thankYouPage = defineType({
  name: "thankYouPage",
  title: "Thank You Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Thank You", validation: (rule) => rule.required() }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({
      name: "steps",
      title: "What happens next — steps",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
    }),
    defineField({
      name: "ctas",
      title: "CTAs",
      type: "array",
      of: [defineArrayMember({ type: "iconCtaLink" })],
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
