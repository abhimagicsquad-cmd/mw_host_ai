import { defineArrayMember, defineField, defineType } from "sanity"

export const heroBlock = defineType({
  name: "heroBlock",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "highlightText",
      title: "Highlighted segment",
      type: "string",
      description: "Optional substring of the title to render in the brand gradient style, e.g. \"10X faster\".",
    }),
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
    defineField({
      name: "showDashboardVisual",
      title: "Show dashboard visual",
      type: "boolean",
      description: "Shows the decorative hosting-metrics graphic beside the hero copy (design is fixed, not editable here).",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow" },
  },
})
