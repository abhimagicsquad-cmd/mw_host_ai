import { defineArrayMember, defineField, defineType } from "sanity"

/** One heading + paragraphs block within a legalPage document. */
export const legalSection = defineType({
  name: "legalSection",
  title: "Legal section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "body",
      title: "Paragraphs",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading" },
  },
})
