import { defineArrayMember, defineField, defineType } from "sanity"

export const aboutCredibilityBlock = defineType({
  name: "aboutCredibilityBlock",
  title: "About / credibility section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "bullets",
      title: "Bullets",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "cta", title: "CTA", type: "ctaLink" }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [defineArrayMember({ type: "statItem" })],
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
