import { defineArrayMember, defineField, defineType } from "sanity"

/** Simple centered page header (title + description + breadcrumbs) used by utility pages like About, Legal, Support — distinct from the two-column `heroBlock` used on marketing pages. */
export const pageHeroBlock = defineType({
  name: "pageHeroBlock",
  title: "Page header",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "breadcrumbs",
      title: "Breadcrumbs",
      type: "array",
      of: [defineArrayMember({ type: "breadcrumbItem" })],
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      options: { list: ["navy", "alt"] },
      initialValue: "navy",
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
