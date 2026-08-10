import { defineField, defineType } from "sanity"

/** The services overview/hub page (currently rendered at /hosting). Repeatable so future hub pages (domain, email-hosting, etc.) can reuse the same schema. */
export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "pageBuilder", title: "Page sections", type: "pageBuilder" }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
})
