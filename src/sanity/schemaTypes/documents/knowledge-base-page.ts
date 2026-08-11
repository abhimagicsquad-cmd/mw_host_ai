import { defineField, defineType } from "sanity"

/** Hero/SEO copy for the /knowledge-base listing page. Categories and articles are separate document types. */
export const knowledgeBasePage = defineType({
  name: "knowledgeBasePage",
  title: "Knowledge Base Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Knowledge Base", validation: (rule) => rule.required() }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "heroDescription", title: "Hero description", type: "text", rows: 2 }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title" },
  },
})
