import { defineArrayMember, defineField, defineType } from "sanity"

export const testimonialsBlock = defineType({
  name: "testimonialsBlock",
  title: "Testimonials section",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "testimonial" }] })],
      validation: (rule) => rule.min(1),
    }),
    defineField({ name: "ctaLabel", title: "Footer CTA label", type: "string" }),
  ],
  preview: {
    select: { title: "title" },
  },
})
