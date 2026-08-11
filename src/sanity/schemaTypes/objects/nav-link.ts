import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

export const navLink = defineType({
  name: "navLink",
  title: "Nav link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "href", title: "Link", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] } }),
    defineField({ name: "external", title: "Opens in new tab", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
