import { defineArrayMember, defineField, defineType } from "sanity"

export const statsBlock = defineType({
  name: "statsBlock",
  title: "Stats section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [defineArrayMember({ type: "statItem" })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
