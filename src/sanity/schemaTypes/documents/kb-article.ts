import { defineField, defineType } from "sanity"

export const kbArticle = defineType({
  name: "kbArticle",
  title: "Knowledge Base Article",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "kbCategory" }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "readTime", title: "Read time", type: "string", description: "e.g. \"3 min read\"", validation: (rule) => rule.required() }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "popular", title: "Popular", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "category.name" },
  },
})
