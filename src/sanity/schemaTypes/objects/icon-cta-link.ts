import { defineField, defineType } from "sanity"

import { iconOptions } from "@/sanity/lib/icon-options"

/** Like ctaLink, but with an icon and a button-style variant — used where the button visually differs (e.g. thank-you page CTAs). */
export const iconCtaLink = defineType({
  name: "iconCtaLink",
  title: "Icon CTA",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "href", title: "Link", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: [...iconOptions] } }),
    defineField({
      name: "variant",
      title: "Button style",
      type: "string",
      options: { list: ["primary", "secondary", "outline", "ghost"] },
      initialValue: "primary",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
