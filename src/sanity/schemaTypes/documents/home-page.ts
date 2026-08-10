import { defineField, defineType } from "sanity"

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Home", validation: (rule) => rule.required() }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "pageBuilder", title: "Page sections", type: "pageBuilder" }),
  ],
  preview: {
    select: { title: "title" },
  },
})
