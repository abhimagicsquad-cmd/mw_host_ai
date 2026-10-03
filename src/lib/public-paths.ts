/**
 * Public URL structure = the WordPress site's (https://magicworkshost.com), trailing slash
 * included, so the rebuild keeps every indexed URL and its backlinks as-is.
 *
 * Routes in `src/app` keep their internal paths (the CMS identifies pages by them). This map
 * serves each page at its WordPress URL (next.config rewrites), redirects the internal path
 * to it, and `publicPath()` turns any internal href into the public one for links,
 * canonicals, the sitemap and structured data.
 *
 * Pure data + functions only: next.config.ts imports this file.
 */

/** WordPress URL → the route that renders it. */
export const WORDPRESS_ROUTES: Record<string, string> = {
  "/about-us-website-hosting-services/": "/about-us",
  "/sitemap/": "/sitemap-page",
  "/50-off/": "/promo/50-off",

  "/web-hosting-cart/": "/hosting", // WordPress's "Web Hosting" all-plans page = the hosting hub
  "/buy-web-hosting/": "/hosting/buy-web-hosting",
  "/unlimited-web-hosting-plans/": "/hosting/unlimited-hosting",
  "/seo-hosting/": "/hosting/seo-hosting",
  "/wordpress-hosting/": "/hosting/wordpress-hosting",
  "/linux-shared-hosting/": "/hosting/linux-shared-hosting",
  "/cheap-fast-reliable-seo-friendly-usa-web-hosting/": "/hosting/usa-web-hosting",

  "/dedicated-server-hosting/": "/dedicated-hosting/dedicated-server",
  "/managed-dedicated-hosting-services/": "/dedicated-hosting/managed-dedicated-server",
  "/linux-dedicated-server-hosting/": "/dedicated-hosting/linux-dedicated-server",

  "/domain-hosting/": "/domain/domain-hosting",
  "/domain-registration-india/": "/domain/indian-domain",
  "/domain-name-registration/": "/domain/domain-name-registration",
  "/buy-domain-name-at-cheap-price/": "/domain/buy-domain-name",
  "/transfer-your-domain-name/": "/domain/transfer-your-domain-name",
  "/renew-your-domain/": "/domain/renew",
  "/domain-name-search-landing-page/": "/domain/search",

  "/buy-ssl-certificate/": "/ssl",
  "/domain-validated-certificates/": "/ssl/domain-validated",
  "/domain-validated-certificate-with-sni-feature/": "/ssl/domain-validated-sni",
  "/business-validated-certificates/": "/ssl/business-validated",
  "/extended-validated-certificates/": "/ssl/extended-validated",
  "/wild-card-certificates/": "/ssl/wildcard",

  "/business-email-hosting/": "/email-hosting/business",
  "/enterprise-email-hosting/": "/email-hosting/enterprise",

  "/web-hosting-bandwidth-calculator/": "/tools/bandwidth-calculator",
  "/data-unit-calculator/": "/tools/data-unit-calculator",
  "/download-upload-time-calculator/": "/tools/transfer-time-calculator",

  "/privacy-policy/": "/legal/privacy-policy",
  "/terms-of-services/": "/legal/terms-of-service",
  "/service-level-agreement/": "/legal/service-level-agreement",
  "/acceptable-use-policy/": "/legal/acceptable-use-policy",
  "/mail-policy/": "/legal/mail-policy",
  "/affiliate-programme-terms/": "/legal/affiliate-programme-terms",
  "/resource-abuse-policy/": "/legal/resource-abuse-policy",
}

/**
 * Extra WordPress URLs for a page that already has a public URL. Rendered at the WordPress URL
 * (no redirect); the page's canonical points to its main URL, so search engines consolidate.
 */
export const WORDPRESS_ALIASES: Record<string, string> = {
  "/resources/": "/blog", // WordPress had its blog index at both /blog/ and /resources/
  "/thank-you-for-subscribing/": "/thank-you?type=newsletter",
  "/thank-you-for-interest-in-affiliate-program/": "/thank-you?type=affiliate",
  "/migration-status/": "/support", // a one-off "we're migrating" notice; support is its successor
  "/demo/": "/", // WordPress theme demo copies of the home page
  "/demo-2/": "/",
}

/** WordPress feeds (not pages): redirected to the blog. */
export const RETIRED_WORDPRESS_URLS: Record<string, string> = {
  "/feed/": "/blog/",
  "/comments/feed/": "/blog/",
  // Older WordPress page URLs still linked from the WordPress sitemap / about pages (and indexed).
  "/linux-hosting/": "/linux-shared-hosting/",
  "/buy-domain-name/": "/buy-domain-name-at-cheap-price/",
  "/vps/": "/vps-hosting/",
  "/linux-dedicated-server/": "/linux-dedicated-server-hosting/",
  "/ssl-certificate/": "/buy-ssl-certificate/",
  "/domain-name-search/": "/domain-name-search-landing-page/",
}

const INTERNAL_TO_PUBLIC: Record<string, string> = Object.fromEntries(
  Object.entries(WORDPRESS_ROUTES).map(([publicUrl, internal]) => [internal, publicUrl])
)

/** Paths that are never pages (and so never get a trailing slash). */
const NON_PAGE = /^\/(api|admin|_next|opengraph-image|twitter-image|icon|apple-icon)(\/|$)/

/**
 * The public URL for an internal href: its WordPress URL when it has one, blog posts at
 * `/<slug>/` and categories at `/category/<slug>/` (WordPress's structure), and a trailing
 * slash on every other page. External links, anchors, files, the API and the admin are
 * returned unchanged.
 */
export function publicPath(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href
  const split = /^([^?#]*)(.*)$/.exec(href)!
  const rest = split[2]
  const bare = split[1].replace(/\/+$/, "") || "/"
  if (bare === "/" || NON_PAGE.test(bare) || /\.[a-z0-9]+$/i.test(bare)) return href

  const mapped = INTERNAL_TO_PUBLIC[bare]
  if (mapped) return mapped + rest

  const category = /^\/blog\/category\/([^/]+)$/.exec(bare)
  if (category) return `/category/${category[1]}/${rest}`
  const post = /^\/blog\/([^/]+)$/.exec(bare)
  if (post && post[1] !== "category") return `/${post[1]}/${rest}`

  return `${bare}/${rest}`
}