import { defineField, defineType } from "sanity"

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Contact", validation: (rule) => rule.required() }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "pageBuilder", title: "Page sections", type: "pageBuilder" }),
  ],
  preview: {
    select: { title: "title" },
  },
})
