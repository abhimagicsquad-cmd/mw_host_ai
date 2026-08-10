import { defineArrayMember, defineField, defineType } from "sanity"

export const serviceGridBlock = defineType({
  name: "serviceGridBlock",
  title: "Service grid",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [defineArrayMember({ type: "serviceCard" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({ name: "ctaLabel", title: "Footer CTA label", type: "string" }),
  ],
  preview: {
    select: { title: "title" },
  },
})
