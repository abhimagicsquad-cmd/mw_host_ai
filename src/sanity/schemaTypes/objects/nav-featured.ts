import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

/** The highlighted card shown alongside a header dropdown's columns (e.g. "New here? Compare plans"). */
export const navFeatured = defineType({
  name: "navFeatured",
  title: "Featured card",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "href", title: "Link", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] } }),
  ],
  preview: {
    select: { title: "title", subtitle: "href" },
  },
})
