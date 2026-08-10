import { defineField, defineType } from "sanity"

export const category = defineType({
  name: "category",
  title: "Blog Category",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
