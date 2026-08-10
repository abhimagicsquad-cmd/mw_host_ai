import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

export const statItem = defineType({
  name: "statItem",
  title: "Stat",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "value", title: "Value", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] } }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
})
