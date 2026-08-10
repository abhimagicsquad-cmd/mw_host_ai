import type { NextConfig } from "next";

// The old WordPress site (see docs/03-route-mapping.md) used flat permalinks with no shared
// prefix, so every legacy path is listed explicitly rather than matched with a wildcard —
// a wildcard here would also catch (and mis-redirect) unrelated current routes like /about-us.
const legacyBlogPostSlugs = [
  "how-to-use-wordpress-to-build-your-online-presence",
  "how-to-create-a-website",
  "best-hosting-for-affiliate-marketing",
  "market-your-business-with-professional-email-address",
  "do-not-take-malware-lightly-it-can-ruin-your-business",
  "want-to-know-different-types-of-ssl-certificates-for-webhosting",
  "moments-of-truth-mot-for-digital-marketer",
  "cannot-ignore-webpage-loading-time",
  "why-you-should-care-about-website-uptime",
  "improve-webpage-speed-and-boost-your-digital-business",
  "take-website-security-seriously-it-affects-seo",
  "need-faster-website-because-slow-website-kill-conversions",
  "when-to-choose-shared-web-hosting-service",
  "are-you-curious-about-types-of-web-hosting",
  "secure-web-hosting-ensuring-security-of-your-website",
  "demystifying-ssl-https-for-business-website",
  "5-best-payment-processing-app-for-your-website",
  "how-to-build-e-commerce-website",
  "what-is-ssl-certificate",
  "when-dedicated-server-should-be-used-for-web-hosting",
  "what-is-web-hosting",
  "blogging-four-steps-guide-for-beginners",
  "importance-of-taking-website-backup",
  "taking-business-online-2-key-steps-after-shared-web-hosting",
  "grow-your-business-even-in-the-days-of-lock-down-and-corona-pandemic-with-best-web-hosting",
  "with-best-web-hosting-no-excuses-take-business-online",
  "3-quick-steps-to-be-online-with-best-web-hosting-company",
  "how-to-choose-best-seo-web-hosting",
  "compare-web-hosting-plans-practical-guide-for-business-owners",
  "why-you-need-domain-registration-for-online-business",
  "what-is-domain-name-and-how-it-works",
  "5-reasons-for-getting-ssl-certificate-for-your-website",
  "here-are-the-reasons-for-taking-your-business-online",
  "comparing-shared-vps-and-dedicated-hosting",
  "website-speed-favors-your-google-ads",
  "what-is-vps-web-hosting",
  "your-customers-have-a-need-for-speedy-website",
  "why-is-web-hosting-important-for-digital-marketing",
  "business-is-always-a-race-where-you-need-to-outrun-your-competitors",
  "what-is-user-experience-and-why-should-you-care",
  "what-is-user-experience-and-why-should-you-care-2",
  "why-your-site-needs-to-stay-up",
];

const legacyBlogCategorySlugs = [
  "affiliate-marketing",
  "blogging",
  "dedicated-hosting",
  "digital-marketing",
  "domain-name",
  "email-hosting",
  "online-business",
  "secure-socket-layer-ssl",
  "secure-web-hosting",
  "shared-web-hosting-service",
  "ssl-certificate",
  "web-designs",
  "web-development",
  "web-hosting",
  "web-security",
];

// 1:1 legacy WordPress path -> current route. The new blog is a fresh set of posts (not a
// port of the old 42), so legacy post/category URLs redirect to the blog index rather than
// a non-existent equivalent. Pages the old site had that were never rebuilt here (the 50-off
// promo, the 3 calculators, the USA-hosting/domain-search/domain-renew pages, and 3 of the 7
// legal docs) are intentionally left unmapped — see docs/03-route-mapping.md.
const legacyRedirects: { source: string; destination: string }[] = [
  { source: "/about-us-website-hosting-services", destination: "/about-us" },
  { source: "/resources", destination: "/blog" },
  { source: "/sitemap", destination: "/sitemap-page" },
  { source: "/web-hosting-cart", destination: "/hosting/buy-web-hosting" },

  { source: "/buy-web-hosting", destination: "/hosting/buy-web-hosting" },
  { source: "/unlimited-web-hosting-plans", destination: "/hosting/unlimited-hosting" },
  { source: "/seo-hosting", destination: "/hosting/seo-hosting" },
  { source: "/wordpress-hosting", destination: "/hosting/wordpress-hosting" },
  { source: "/linux-shared-hosting", destination: "/hosting/linux-shared-hosting" },

  { source: "/dedicated-server-hosting", destination: "/dedicated-hosting/dedicated-server" },
  { source: "/managed-dedicated-hosting-services", destination: "/dedicated-hosting/managed-dedicated-server" },
  { source: "/linux-dedicated-server-hosting", destination: "/dedicated-hosting/linux-dedicated-server" },

  { source: "/domain-hosting", destination: "/domain/domain-hosting" },
  { source: "/domain-registration-india", destination: "/domain/indian-domain" },
  { source: "/domain-name-registration", destination: "/domain/domain-name-registration" },
  { source: "/buy-domain-name-at-cheap-price", destination: "/domain/buy-domain-name" },
  { source: "/transfer-your-domain-name", destination: "/domain/transfer-your-domain-name" },

  // The 5 individual certificate pages were consolidated into the single /ssl pillar page,
  // which already carries the differentiated pricing they used to (inconsistently) show.
  { source: "/buy-ssl-certificate", destination: "/ssl" },
  { source: "/business-validated-certificates", destination: "/ssl" },
  { source: "/domain-validated-certificate-with-sni-feature", destination: "/ssl" },
  { source: "/domain-validated-certificates", destination: "/ssl" },
  { source: "/extended-validated-certificates", destination: "/ssl" },
  { source: "/wild-card-certificates", destination: "/ssl" },

  { source: "/business-email-hosting", destination: "/email-hosting/business" },
  { source: "/enterprise-email-hosting", destination: "/email-hosting/enterprise" },

  { source: "/thank-you-for-subscribing", destination: "/thank-you" },
  { source: "/thank-you-for-interest-in-affiliate-program", destination: "/thank-you" },

  { source: "/privacy-policy", destination: "/legal/privacy-policy" },
  { source: "/terms-of-services", destination: "/legal/terms-of-service" },
  { source: "/service-level-agreement", destination: "/legal/service-level-agreement" },
  { source: "/acceptable-use-policy", destination: "/legal/acceptable-use-policy" },

  ...legacyBlogPostSlugs.map((slug) => ({ source: `/${slug}`, destination: "/blog" })),
  ...legacyBlogCategorySlugs.map((slug) => ({ source: `/category/${slug}`, destination: "/blog" })),
];

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
  },
  // The Studio (sanity/@sanity/vision) is client-only and incompatible with Next's
  // "react-server" bundling condition (e.g. swr's default export) when reached from a
  // Server Component — load it via Node's require() instead of bundling it.
  serverExternalPackages: ["sanity", "@sanity/vision"],
  async redirects() {
    return legacyRedirects.map(({ source, destination }) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
