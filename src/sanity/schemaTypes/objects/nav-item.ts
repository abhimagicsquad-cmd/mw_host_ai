import { defineArrayMember, defineField, defineType } from "sanity"

/** One top-level header menu entry — either a plain link, or a dropdown trigger with columns + an optional featured card. */
export const navItem = defineType({
  name: "navItem",
  title: "Nav item",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "href", title: "Link", type: "string" }),
    defineField({ name: "external", title: "Opens in new tab", type: "boolean", initialValue: false }),
    defineField({
      name: "columns",
      title: "Dropdown columns",
      type: "array",
      of: [defineArrayMember({ type: "navColumn" })],
      description: "Leave empty for a plain top-level link with no dropdown.",
    }),
    defineField({ name: "featured", title: "Featured card", type: "navFeatured" }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
