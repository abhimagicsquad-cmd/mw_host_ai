import type { NextConfig } from "next";

import { RETIRED_WORDPRESS_URLS, WORDPRESS_ALIASES, WORDPRESS_ROUTES } from "./src/lib/public-paths";

/**
 * URL parity with the WordPress site (https://magicworkshost.com): pages are served at the
 * WordPress URLs themselves, trailing slash included (see src/lib/public-paths.ts).
 *
 * - WordPress URLs render directly (rewrites to the internal route).
 * - Internal route paths (/legal/privacy-policy, /blog/<post>, /blog/category/<topic>)
 *   and slash-less page URLs 308 to the public URL in one hop.
 * - WordPress aliases of a page (/resources/ for the blog) render too, canonical to the page.
 * - WordPress feed URLs 308 to the blog.
 */
const permanent = (source: string, destination: string) => ({ source, destination, permanent: true });
const bothSlashes = (path: string) => [path.replace(/\/$/, ""), path.endsWith("/") ? path : `${path}/`];

const internalPathRedirects = Object.entries(WORDPRESS_ROUTES).flatMap(([publicUrl, internal]) =>
  bothSlashes(internal).map((source) => permanent(source, publicUrl))
);
const retiredRedirects = Object.entries(RETIRED_WORDPRESS_URLS).flatMap(([oldUrl, target]) =>
  bothSlashes(oldUrl).map((source) => permanent(source, target))
);
// Blog posts live at /<slug>/ and categories at /category/<topic>/, as on WordPress.
const blogStructureRedirects = [
  permanent("/blog/category/:topic", "/category/:topic/"),
  permanent("/blog/category/:topic/", "/category/:topic/"),
  permanent("/blog/:slug((?!category$)[^/]+)", "/:slug/"),
  permanent("/blog/:slug((?!category$)[^/]+)/", "/:slug/"),
];

const wordpressRewrites = Object.entries({ ...WORDPRESS_ROUTES, ...WORDPRESS_ALIASES }).map(([publicUrl, internal]) => ({ source: publicUrl, destination: internal }));

// WordPress system URLs that search engines and feed readers still request.
const wordpressSystemRedirects = [
  permanent("/index.php", "/"),
  permanent("/sitemap_index.xml", "/sitemap.xml"),
  permanent("/post-sitemap.xml", "/sitemap.xml"),
  permanent("/page-sitemap.xml", "/sitemap.xml"),
  permanent("/category-sitemap.xml", "/sitemap.xml"),
];

// Slash-less page URLs get their trailing slash in src/proxy.ts: Next matches redirect
// sources with an optional trailing slash, so a config rule would redirect "/x/" to itself.

/** WHMCS stays on the current server at www.magicworkshost.com/clients (see src/lib/billing.ts). */
const billingBase = (process.env.NEXT_PUBLIC_BILLING_URL || "https://www.magicworkshost.com/clients").replace(/\/$/, "");
const billingOrigin = new URL(billingBase).origin;

const wordpressPatternRedirects = [
  // WordPress site search (/?s=term — its search forms and old links) → the site search page.
  { source: "/", has: [{ type: "query" as const, key: "s", value: "(?<term>.*)" }], destination: "/search/?q=:term", permanent: true },
  // Old relative /clients links → the billing system (308 keeps POSTs intact).
  { source: "/clients", destination: billingBase, permanent: true },
  { source: "/clients/:path*", destination: `${billingBase}/:path*`, permanent: true },
  // (No /wp-content redirect: WordPress on www 301s to the apex, which would loop back here.)
  { source: "/wp-admin/:path*", destination: "/", permanent: false },
  { source: "/wp-login.php", destination: "/", permanent: false },
  { source: "/author/:name/:rest*", destination: "/blog/", permanent: true },
  { source: "/tag/:tag/:rest*", destination: "/blog/", permanent: true },
  { source: "/page/:n/:rest*", destination: "/blog/", permanent: true },
  { source: "/category/:slug/page/:n/:rest*", destination: "/category/:slug/", permanent: true },
  { source: "/:slug/feed/:rest*", destination: "/:slug/", permanent: true },
];

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "https://*.supabase.co";

/**
 * Public-site third parties (see src/lib/analytics.ts): Google Ads gtag, Microsoft Clarity and
 * Tidio live chat — the same tracking and chat the WordPress site ran.
 */
const tracking = {
  script: " https://www.googletagmanager.com https://*.googleadservices.com https://googleads.g.doubleclick.net https://*.clarity.ms https://code.tidio.co https://*.tidio.co https://*.tidiochat.com",
  // Ads conversions post to the visitor's country Google host (google.co.in, google.de, …) and
  // doubleclick, which can't be listed exhaustively — so any https endpoint and image. Scripts,
  // frames and fonts stay allowlisted.
  connect: " https: wss://*.tidio.co",
  img: " https:",
  // + the Google Maps embed of the office on /contact-us.
  frame: " https://*.doubleclick.net https://www.googletagmanager.com https://*.tidio.co https://*.tidiochat.com https://www.google.com",
  font: " https://*.tidio.co https://*.tidiochat.com",
};

function csp(extra: { script?: string; connect?: string; img?: string; frame?: string; font?: string } = {}) {
  return [
    "default-src 'self'",
    // Next.js injects inline bootstrap scripts into statically rendered pages, which rules out
    // nonces without making every page dynamic; everything else is locked to this origin.
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${extra.script ?? ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseOrigin}${extra.img ?? ""}`,
    `font-src 'self' data:${extra.font ?? ""}`,
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
  // No Cross-Origin-Opener-Policy: `same-origin` forces a browsing-context-group switch that
  // breaks Lighthouse / PageSpeed Insights navigation traces (NO_NAVSTART), and the site has
  // no cross-window flows for it to protect. Framing is already blocked (XFO + frame-ancestors).
  // No includeSubDomains: www (WHMCS) and other subdomains stay on the existing server.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Trailing slashes follow WordPress (pages end in "/"); src/proxy.ts adds them to page URLs
  // only, so the admin and API keep their slash-less URLs.
  skipTrailingSlashRedirect: true,
  images: {
    dangerouslyAllowSVG: true,
  },
  async redirects() {
    return [
      ...internalPathRedirects,
      ...blogStructureRedirects,
      ...retiredRedirects,
      ...wordpressSystemRedirects,
      ...wordpressPatternRedirects,
    ];
  },
  async rewrites() {
    return wordpressRewrites;
  },
  async headers() {
    return [
      { source: "/:path*", headers: [...securityHeaders, { key: "Content-Security-Policy", value: csp(tracking) }] },
      // Admin: media previews may be any https image the editor pastes.
      { source: "/admin/:path*", headers: [{ key: "Content-Security-Policy", value: csp({ img: " https:" }) }] },
      { source: "/mwh-admin-login", headers: [{ key: "Content-Security-Policy", value: csp({ img: " https:" }) }] },
    ];
  },
};

export default nextConfig;
