import { defineField, defineType } from "sanity"

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role / title", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "quote", title: "Quote", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "avatar", title: "Avatar", type: "image", options: { hotspot: true } }),
    defineField({ name: "rating", title: "Rating (1-5)", type: "number", validation: (rule) => rule.min(1).max(5) }),
  ],
  preview: {
    select: { title: "name", subtitle: "company" },
  },
})
