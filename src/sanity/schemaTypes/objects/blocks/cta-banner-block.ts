import { defineField, defineType } from "sanity"

export const ctaBannerBlock = defineType({
  name: "ctaBannerBlock",
  title: "CTA banner",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "ctaLink" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "ctaLink" }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      options: { list: ["default", "alt", "navy"] },
      initialValue: "navy",
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
