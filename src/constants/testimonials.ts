import type { Testimonial } from "@/types/content"

/**
 * Customer testimonials, migrated verbatim from the "homepage testimonials" on the live
 * WordPress site (magicworkshost.com), with the customer photos it shows. Add or edit
 * testimonials in the CMS (Testimonials section); these are the default set.
 */
export const testimonials: Testimonial[] = [
  {
    name: "Mr. Vishal Bhatia",
    title: "Director",
    company: "SimpliDistance",
    quote:
      "I wanted to pass along my praise for both the ease of Magic Host programs, and in particular, improving conversions over the period of time. Mr. Sudhir Dixit has rightly remarked the growth prospects we can gain in future from our website.",
    avatarUrl: "/images/testimonials/vishal-bhatia.jpg",
  },
  {
    name: "Mr. Prashant Karhade",
    title: "Head",
    company: "Business Practices Group at Nitor Infotech",
    quote:
      "I had some questions regarding DNS record updates & web root directory. We were actually taking efforts upon traffic on our new website as well. Magic Host has been extremely helpful with this task, and for that, I thank entire Magic Host Team",
    avatarUrl: "/images/testimonials/prashant-karhade.jpg",
  },
  {
    name: "Mr. Swapnil Mahajan",
    title: "Director",
    company: "Recrotech Design System",
    quote:
      "Magic Host helped me resolving problems we were facing while uploading CGI scripts. They really did a good job & I feel confident of the selection I made for Web Hosting services.",
    avatarUrl: "/images/testimonials/swapnil-mahajan.jpg",
  },
  {
    name: "Mr. Ashish Mukharji",
    title: "Director",
    company: "SpectroLabs System",
    quote:
      "I really appreciate all the efforts by Magic host team for my website. My website has been deteriorated over past 6 to 8 months. However, Magic Host Definately helped us carrying out our business functions uninterrupted.",
    avatarUrl: "/images/testimonials/asish-mukharji.jpg",
  },
]

/**
 * Invented testimonials that shipped in early seed content (and still exist in Sanity and in
 * migrated CMS drafts). They are never rendered.
 */
export const PLACEHOLDER_TESTIMONIAL_NAMES = new Set([
  "Anita Sharma",
  "Rohit Verma",
  "Priya Nair",
  "Karan Mehta",
  "Sneha Kulkarni",
  "Arjun Rao",
  "Deepika Joshi",
  "Meera Iyer",
])

export function withoutPlaceholderTestimonials<T extends { name: string }>(items: T[]): T[] {
  return items.filter((item) => !PLACEHOLDER_TESTIMONIAL_NAMES.has(item.name.trim()))
}
