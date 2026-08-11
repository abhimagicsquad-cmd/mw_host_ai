import { defineArrayMember, defineField, defineType } from "sanity"

/** Backs /legal/[slug] — covers privacy-policy, terms-of-service, service-level-agreement, acceptable-use-policy. */
export const legalPage = defineType({
  name: "legalPage",
  title: "Legal Page",
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
    defineField({ name: "summary", title: "Summary", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "string",
      description: "Displayed as-is, e.g. \"August 7, 2026\".",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [defineArrayMember({ type: "legalSection" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
})
