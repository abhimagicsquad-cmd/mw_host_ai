import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

export const supportChannel = defineType({
  name: "supportChannel",
  title: "Support channel",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] }, validation: (rule) => rule.required() }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "ctaHref", title: "CTA link", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "external", title: "Opens in new tab", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
})
