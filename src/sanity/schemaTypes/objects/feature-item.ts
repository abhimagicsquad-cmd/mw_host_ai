import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

export const featureItem = defineType({
  name: "featureItem",
  title: "Feature",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] } }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
})
