import { defineField, defineType } from "sanity"

export const richTextBlock = defineType({
  name: "richTextBlock",
  title: "Rich text section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "content", title: "Content", type: "blockContent", validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "title" },
  },
})
