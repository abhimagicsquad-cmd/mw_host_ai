import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

export const kbCategory = defineType({
  name: "kbCategory",
  title: "Knowledge Base Category",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] }, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current" },
  },
})
