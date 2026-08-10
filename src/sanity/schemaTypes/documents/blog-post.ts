import { defineField, defineType } from "sanity"

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
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
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }] }),
    defineField({ name: "category", title: "Category", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "readTime", title: "Read time", type: "string", description: "e.g. 5 min read" }),
    defineField({ name: "body", title: "Body", type: "blockContent", validation: (rule) => rule.required() }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "excerpt", media: "coverImage" },
  },
})
