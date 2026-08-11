import { defineArrayMember, defineField, defineType } from "sanity"

/** Singleton — header menu + footer link columns. Header/footer contact info, socials, and CTA label live on siteSettings. */
export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Navigation", validation: (rule) => rule.required() }),
    defineField({
      name: "mainMenu",
      title: "Header menu",
      type: "array",
      of: [defineArrayMember({ type: "navItem" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "footerColumns",
      title: "Footer columns",
      type: "array",
      of: [defineArrayMember({ type: "navColumn" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
})
