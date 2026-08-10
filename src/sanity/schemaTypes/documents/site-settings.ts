import { defineArrayMember, defineField, defineType } from "sanity"

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "favicon", title: "Favicon", type: "image" }),
    defineField({ name: "headerCta", title: "Header CTA", type: "ctaLink" }),
    defineField({ name: "footerContent", title: "Footer content", type: "blockContent" }),
    defineField({
      name: "contactPhone",
      title: "Contact phone (display)",
      type: "string",
      description: "e.g. +91 8421903846",
    }),
    defineField({
      name: "contactPhoneHref",
      title: "Contact phone (tel: link)",
      type: "string",
      description: "e.g. tel:+918421903846",
    }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string", validation: (rule) => rule.email() }),
    defineField({ name: "contactAddress", title: "Contact address", type: "text", rows: 2 }),
    defineField({ name: "salesHours", title: "Sales hours", type: "string" }),
    defineField({ name: "accountingHours", title: "Accounting hours", type: "string" }),
    defineField({ name: "supportHours", title: "Support hours", type: "string" }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: { list: ["Facebook", "Twitter", "LinkedIn", "Instagram", "YouTube"] },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "url", title: "URL", type: "url", validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
    defineField({ name: "seoDefaults", title: "SEO defaults", type: "seo" }),
    defineField({ name: "globalCta", title: "Global CTA content", type: "ctaLink" }),
  ],
  preview: {
    select: { title: "siteName" },
  },
})
