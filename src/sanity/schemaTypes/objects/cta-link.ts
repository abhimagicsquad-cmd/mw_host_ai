import { defineField, defineType } from "sanity"

export const ctaLink = defineType({
  name: "ctaLink",
  title: "CTA",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Relative path (/contact-us), anchor (#pricing), or #lead to open the lead form popup.",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "external", title: "Opens in new tab", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
