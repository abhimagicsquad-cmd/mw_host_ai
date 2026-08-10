import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

/** A curated teaser card for `serviceGridBlock` — intentionally not a reference so the grid can hand-pick copy/price independent of the full service page. */
export const serviceCard = defineType({
  name: "serviceCard",
  title: "Service card",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] } }),
    defineField({ name: "href", title: "Link", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "price", title: "Price", type: "string" }),
    defineField({ name: "priceSuffix", title: "Price suffix", type: "string" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "price" },
  },
})
