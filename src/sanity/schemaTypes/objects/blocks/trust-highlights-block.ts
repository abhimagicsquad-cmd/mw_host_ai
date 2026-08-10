import { defineArrayMember, defineField, defineType } from "sanity"

export const trustHighlightsBlock = defineType({
  name: "trustHighlightsBlock",
  title: "Trust highlights",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      options: { list: ["default", "alt", "navy"] },
      initialValue: "default",
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
