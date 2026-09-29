import type { MetadataRoute } from "next"

import { siteConfig } from "@/constants/site-config"

const PRIVATE = ["/api/", "/admin", "/studio", "/order/"]

/** AI search / answer-engine crawlers, explicitly welcomed so the site can be cited in AI answers. */
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Bingbot", "Applebot-Extended"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
