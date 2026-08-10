import { defineField, defineType } from "sanity"

export const bannerBlock = defineType({
  name: "bannerBlock",
  title: "Announcement banner",
  type: "object",
  fields: [
    defineField({ name: "message", title: "Message", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "cta", title: "CTA", type: "ctaLink" }),
    defineField({ name: "dismissible", title: "Dismissible", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "message" },
  },
})
