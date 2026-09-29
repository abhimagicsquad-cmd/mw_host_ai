import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

/**
 * URL continuity with the WordPress site (https://magicworkshost.com). Every URL in its
 * sitemap resolves here in ONE 301 hop — with or without the trailing slash WordPress
 * uses — to its closest equivalent page. See docs/13-launch-readiness.md for the inventory.
 */

// Old blog posts now live at /blog/<slug> with their full content (imported by
// scripts/import-wordpress-posts.mjs), so each keeps its own URL rather than the blog index.
const legacyPosts: { slug: string; legacyPath: string }[] = JSON.parse(
  readFileSync(new URL("./src/constants/legacy-blog-posts.json", import.meta.url), "utf8")
);

// WordPress categories → blog category pages.
const legacyCategories: Record<string, string> = {
  "affiliate-marketing": "business",
  blogging: "wordpress",
  "dedicated-hosting": "web-hosting",
  "digital-marketing": "business",
  "domain-name": "domains-email",
  "email-hosting": "domains-email",
  "online-business": "business",
  "secure-socket-layer-ssl": "security",
  "secure-web-hosting": "security",
  "shared-web-hosting-service": "web-hosting",
  "ssl-certificate": "security",
  "web-designs": "web-development",
  "web-development": "web-development",
  "web-hosting": "web-hosting",
  "web-security": "security",
};

const legacyPages: Record<string, string> = {
  "/about-us-website-hosting-services": "/about-us",
  "/resources": "/blog",
  "/sitemap": "/sitemap-page",
  "/web-hosting-cart": "/hosting/buy-web-hosting",
  "/migration-status": "/support",
  "/demo": "/",
  "/demo-2": "/",

  "/buy-web-hosting": "/hosting/buy-web-hosting",
  "/unlimited-web-hosting-plans": "/hosting/unlimited-hosting",
  "/seo-hosting": "/hosting/seo-hosting",
  "/wordpress-hosting": "/hosting/wordpress-hosting",
  "/linux-shared-hosting": "/hosting/linux-shared-hosting",
  "/cheap-fast-reliable-seo-friendly-usa-web-hosting": "/hosting/usa-web-hosting",
  "/50-off": "/promo/50-off",

  "/dedicated-server-hosting": "/dedicated-hosting/dedicated-server",
  "/managed-dedicated-hosting-services": "/dedicated-hosting/managed-dedicated-server",
  "/linux-dedicated-server-hosting": "/dedicated-hosting/linux-dedicated-server",

  "/domain-hosting": "/domain/domain-hosting",
  "/domain-registration-india": "/domain/indian-domain",
  "/domain-name-registration": "/domain/domain-name-registration",
  "/buy-domain-name-at-cheap-price": "/domain/buy-domain-name",
  "/transfer-your-domain-name": "/domain/transfer-your-domain-name",
  "/renew-your-domain": "/domain/renew",
  "/domain-name-search-landing-page": "/domain/search",

  // Each certificate type has its own page again, so the old per-certificate URLs map 1:1.
  "/buy-ssl-certificate": "/ssl",
  "/domain-validated-certificates": "/ssl/domain-validated",
  "/domain-validated-certificate-with-sni-feature": "/ssl/domain-validated-sni",
  "/business-validated-certificates": "/ssl/business-validated",
  "/extended-validated-certificates": "/ssl/extended-validated",
  "/wild-card-certificates": "/ssl/wildcard",

  "/business-email-hosting": "/email-hosting/business",
  "/enterprise-email-hosting": "/email-hosting/enterprise",

  "/web-hosting-bandwidth-calculator": "/tools/bandwidth-calculator",
  "/data-unit-calculator": "/tools/data-unit-calculator",
  "/download-upload-time-calculator": "/tools/transfer-time-calculator",

  "/thank-you-for-subscribing": "/thank-you",
  "/thank-you-for-interest-in-affiliate-program": "/thank-you",

  "/privacy-policy": "/legal/privacy-policy",
  "/terms-of-services": "/legal/terms-of-service",
  "/service-level-agreement": "/legal/service-level-agreement",
  "/acceptable-use-policy": "/legal/acceptable-use-policy",
  "/mail-policy": "/legal/mail-policy",
  "/affiliate-programme-terms": "/legal/affiliate-programme-terms",
  "/resource-abuse-policy": "/legal/resource-abuse-policy",

  // WordPress system URLs that search engines and feed readers still request.
  "/feed": "/blog",
  "/comments/feed": "/blog",
  "/index.php": "/",
  "/sitemap_index.xml": "/sitemap.xml",
  "/post-sitemap.xml": "/sitemap.xml",
  "/page-sitemap.xml": "/sitemap.xml",
  "/category-sitemap.xml": "/sitemap.xml",
};

for (const post of legacyPosts) legacyPages[post.legacyPath.replace(/\/$/, "")] = `/blog/${post.slug}`;
for (const [wp, slug] of Object.entries(legacyCategories)) legacyPages[`/category/${wp}`] = `/blog/category/${slug}`;

/** One redirect per legacy URL, matching both "/path" and "/path/" (WordPress's canonical form). */
const legacyRedirects = Object.entries(legacyPages).flatMap(([source, destination]) => [
  { source, destination, permanent: true },
  { source: `${source}/`, destination, permanent: true },
]);

/** WHMCS stays on the current server at www.magicworkshost.com/clients (see src/lib/billing.ts). */
const billingBase = (process.env.NEXT_PUBLIC_BILLING_URL || "https://www.magicworkshost.com/clients").replace(/\/$/, "");
const billingOrigin = new URL(billingBase).origin;

const wordpressPatternRedirects = [
  // Old relative /clients links → the billing system (308 keeps POSTs intact).
  { source: "/clients", destination: billingBase, permanent: true },
  { source: "/clients/:path*", destination: `${billingBase}/:path*`, permanent: true },
  // (No /wp-content redirect: WordPress on www 301s to the apex, which would loop back here.)
  { source: "/wp-admin/:path*", destination: "/", permanent: false },
  { source: "/wp-login.php", destination: "/", permanent: false },
  { source: "/author/:name/:rest*", destination: "/blog", permanent: true },
  { source: "/tag/:tag/:rest*", destination: "/blog", permanent: true },
  { source: "/page/:n/:rest*", destination: "/blog", permanent: true },
  { source: "/category/:slug/page/:n/:rest*", destination: "/blog", permanent: true },
  { source: "/:slug/feed/:rest*", destination: "/blog", permanent: true },
];

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "https://*.supabase.co";

function csp(extra: { script?: string; connect?: string; img?: string; frame?: string } = {}) {
  return [
    "default-src 'self'",
    // Next.js injects inline bootstrap scripts into statically rendered pages, which rules out
    // nonces without making every page dynamic; everything else is locked to this origin.
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${extra.script ?? ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://cdn.sanity.io ${supabaseOrigin}${extra.img ?? ""}`,
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} https://challenges.cloudflare.com${extra.connect ?? ""}`,
    `frame-src https://challenges.cloudflare.com${extra.frame ?? ""}`,
    "frame-ancestors 'none'",
    `form-action 'self' ${billingOrigin}`,
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // No includeSubDomains: www (WHMCS) and other subdomains stay on the existing server.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Trailing slashes are handled by the redirects below so a legacy "/path/" URL takes a
  // single hop to its new page instead of two (strip slash, then redirect).
  skipTrailingSlashRedirect: true,
  images: {
    dangerouslyAllowSVG: true,
  },
  // The Studio (sanity/@sanity/vision) is client-only and incompatible with Next's
  // "react-server" bundling condition (e.g. swr's default export) when reached from a
  // Server Component — load it via Node's require() instead of bundling it.
  serverExternalPackages: ["sanity", "@sanity/vision"],
  async redirects() {
    return [
      ...legacyRedirects,
      ...wordpressPatternRedirects,
      // Any other URL with a trailing slash → the same URL without it (the site's canonical form).
      { source: "/:path+/", destination: "/:path+", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: [...securityHeaders, { key: "Content-Security-Policy", value: csp() }] },
      // Admin: media previews may be any https image the editor pastes.
      { source: "/admin/:path*", headers: [{ key: "Content-Security-Policy", value: csp({ img: " https:" }) }] },
      // Sanity Studio needs eval, its APIs/websockets and remote images.
      {
        source: "/studio/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp({ script: " 'unsafe-eval'", connect: " https://*.sanity.io wss://*.sanity.io https://*.apicdn.sanity.io", img: " https:", frame: " https://*.sanity.io" }),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
