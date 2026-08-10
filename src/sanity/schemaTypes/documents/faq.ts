import { defineField, defineType } from "sanity"

/** Reusable sitewide FAQ bank — referenced from `faqBlock` on any page's pageBuilder. */
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Optional grouping label, e.g. Billing, Hosting, Domains.",
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "category" },
  },
})
