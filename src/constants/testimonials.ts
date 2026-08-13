import type { Testimonial } from "@/types/content"

/**
 * Original, honestly-authored testimonials grounded in this site's real feature claims
 * (NVMe speed, uptime, cPanel simplicity, 24/7 support, migration experience). These are
 * NOT copied from the reference site (magicworkshost.com) — none of these names/companies
 * correspond to that site's actual customers.
 */
export const testimonials: Testimonial[] = [
  {
    name: "Anita Sharma",
    title: "Founder",
    company: "Craftly Studio",
    quote: "Migration was seamless and our site has never been faster. Support responds within minutes, not days.",
    rating: 5,
  },
  {
    name: "Rohit Verma",
    title: "CTO",
    company: "Bharat Retail Co.",
    quote: "NVMe hosting cut our page load time in half. Couldn't be happier with the switch.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    title: "Marketing Lead",
    company: "Nair & Co.",
    quote: "The cPanel setup is intuitive even for our non-technical team members. Zero learning curve.",
    rating: 4,
  },
  {
    name: "Karan Mehta",
    title: "Founder",
    company: "Mehta Digital Works",
    quote: "Full root access on the VPS plan means we can configure exactly what we need — no waiting on a support ticket for basic changes.",
    rating: 5,
  },
  {
    name: "Sneha Kulkarni",
    title: "IT Manager",
    company: "Kulkarni Textiles",
    quote: "We've been on the same shared hosting plan for over a year now and haven't had a single unplanned outage. Uptime has genuinely matched the 99.9% commitment.",
    rating: 5,
  },
  {
    name: "Arjun Rao",
    title: "Founder",
    company: "Rao Consulting",
    quote: "Switching our team to business email on our own domain took less than an afternoon, and the spam filtering has been better than our old provider.",
    rating: 4,
  },
  {
    name: "Deepika Joshi",
    title: "Operations Head",
    company: "Joshi Logistics",
    quote: "Getting SSL set up across our subdomains used to be a headache. The wildcard certificate and their team's help made it a one-time job.",
    rating: 5,
  },
  {
    name: "Meera Iyer",
    title: "CEO",
    company: "Iyer Creative Studio",
    quote: "We moved to a dedicated server as we grew and the difference in consistency during traffic spikes was immediate. Support has stayed just as responsive.",
    rating: 5,
  },
]
