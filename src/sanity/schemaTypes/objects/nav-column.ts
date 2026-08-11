import { defineArrayMember, defineField, defineType } from "sanity"

/** Used for both header dropdown columns and footer link columns — same shape (optional heading + links). */
export const navColumn = defineType({
  name: "navColumn",
  title: "Nav column",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [defineArrayMember({ type: "navLink" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "links.0.label" },
  },
})
