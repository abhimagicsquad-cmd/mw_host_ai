import { defineArrayMember, defineField, defineType } from "sanity"

export const heroBlock = defineType({
  name: "heroBlock",
  title: "Hero",
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
    defineField({ name: "primaryCta", title: "Primary CTA", type: "ctaLink" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "ctaLink" }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [defineArrayMember({ type: "statItem" })],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow" },
  },
})
