import { defineField, defineType } from "sanity"

export const breadcrumbItem = defineType({
  name: "breadcrumbItem",
  title: "Breadcrumb",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "href", title: "Link", type: "string", description: "Leave empty for the current (non-linked) page." }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
