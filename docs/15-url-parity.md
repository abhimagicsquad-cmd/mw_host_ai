# URL parity with the WordPress site

The rebuild uses the WordPress site's URL structure, trailing slash included. Every URL in `https://magicworkshost.com/sitemap_index.xml` (109 URLs across the post, page and category sitemaps) is served **at the same URL with a 200 and no redirect**. Verified on 2026-09-29 by `parity.mjs` against a production build: **109/109 exact**.

## How it works

`src/lib/public-paths.ts` is the single source of truth.

- **`WORDPRESS_ROUTES`** maps each WordPress URL to the route that renders it (for example `/privacy-policy/` → `/legal/privacy-policy`).
  - `next.config.ts` rewrites the WordPress URL to that route.
  - The route's internal path 308s to the WordPress URL, so each page has exactly one public URL.
- **Blog posts** live at `/<slug>/`, served by the root catch-all route, exactly as on WordPress.
- **Categories** live at `/category/<slug>/`:
  - all 15 WordPress category archives (each lists the posts WordPress filed under it);
  - plus the blog's topic pages. The two slugs that are both use the topic page.
- **`WORDPRESS_ALIASES`** covers WordPress URLs that duplicated another page (`/resources/` = the blog index, the two extra thank-you pages, `/migration-status/`, `/demo/`, `/demo-2/`).
  - They render at their own URL.
  - Their canonical points to the main page, so search engines consolidate them without a redirect.
- **Trailing slashes:** a slash-less page URL 308s to the slashed one. This happens in `src/proxy.ts`, not in `next.config`, because Next matches config redirect sources with an optional slash, and such a rule would loop.
  - `/admin/*`, `/api/*`, `/studio`, `/order/*`, generated images and files keep their exact URLs.
  - The dashboard login stays at `/admin/login`.
- **Links and metadata:** every link, canonical tag, sitemap entry, breadcrumb, JSON-LD URL and search result is emitted through `publicPath()`.
  - Public components use `SiteLink`, which also maps hrefs stored in the CMS or in Sanity.
  - Internal links never go through a redirect. The crawl found 0 internal links that redirect.
- **Dashboard paths:** pages keep their internal path in the dashboard (for example `/legal/privacy-policy`). "View page" and Preview follow the redirect to the public URL.

Kept as redirects (not pages): WordPress feeds, `/index.php`, the `*-sitemap.xml` files, `wp-admin` / `wp-login.php`, author, tag and paginated archives, and `/clients/*` (→ WHMCS).

## New-site pages with no WordPress equivalent

- **Hubs:** `/domain/`, `/email-hosting/`, `/knowledge-base/`, `/knowledge-base/category/*/`.
- **Search:** `/search/`.
- **New articles:** 7 articles at `/<slug>/`.
- **Blog topics:** `/category/business|domains-email|performance|security|wordpress/`.

These follow the same URL style.

## Mapping table (all 109 WordPress URLs)

| WordPress URL | Before this phase | Final URL (200, no redirect) | How |
|---|---|---|---|
| `/how-to-use-wordpress-to-build-your-online-presence/` | `/blog/how-to-use-wordpress-to-build-your-online-presence` | `/how-to-use-wordpress-to-build-your-online-presence/` | article, now a root route (like WordPress) |
| `/how-to-create-a-website/` | `/blog/how-to-create-a-website` | `/how-to-create-a-website/` | article, now a root route (like WordPress) |
| `/best-hosting-for-affiliate-marketing/` | `/blog/best-hosting-for-affiliate-marketing` | `/best-hosting-for-affiliate-marketing/` | article, now a root route (like WordPress) |
| `/market-your-business-with-professional-email-address/` | `/blog/market-your-business-with-professional-email-address` | `/market-your-business-with-professional-email-address/` | article, now a root route (like WordPress) |
| `/do-not-take-malware-lightly-it-can-ruin-your-business/` | `/blog/do-not-take-malware-lightly-it-can-ruin-your-business` | `/do-not-take-malware-lightly-it-can-ruin-your-business/` | article, now a root route (like WordPress) |
| `/want-to-know-different-types-of-ssl-certificates-for-webhosting/` | `/blog/want-to-know-different-types-of-ssl-certificates-for-webhosting` | `/want-to-know-different-types-of-ssl-certificates-for-webhosting/` | article, now a root route (like WordPress) |
| `/moments-of-truth-mot-for-digital-marketer/` | `/blog/moments-of-truth-mot-for-digital-marketer` | `/moments-of-truth-mot-for-digital-marketer/` | article, now a root route (like WordPress) |
| `/cannot-ignore-webpage-loading-time/` | `/blog/cannot-ignore-webpage-loading-time` | `/cannot-ignore-webpage-loading-time/` | article, now a root route (like WordPress) |
| `/why-you-should-care-about-website-uptime/` | `/blog/why-you-should-care-about-website-uptime` | `/why-you-should-care-about-website-uptime/` | article, now a root route (like WordPress) |
| `/improve-webpage-speed-and-boost-your-digital-business/` | `/blog/improve-webpage-speed-and-boost-your-digital-business` | `/improve-webpage-speed-and-boost-your-digital-business/` | article, now a root route (like WordPress) |
| `/take-website-security-seriously-it-affects-seo/` | `/blog/take-website-security-seriously-it-affects-seo` | `/take-website-security-seriously-it-affects-seo/` | article, now a root route (like WordPress) |
| `/need-faster-website-because-slow-website-kill-conversions/` | `/blog/need-faster-website-because-slow-website-kill-conversions` | `/need-faster-website-because-slow-website-kill-conversions/` | article, now a root route (like WordPress) |
| `/when-to-choose-shared-web-hosting-service/` | `/blog/when-to-choose-shared-web-hosting-service` | `/when-to-choose-shared-web-hosting-service/` | article, now a root route (like WordPress) |
| `/are-you-curious-about-types-of-web-hosting/` | `/blog/are-you-curious-about-types-of-web-hosting` | `/are-you-curious-about-types-of-web-hosting/` | article, now a root route (like WordPress) |
| `/secure-web-hosting-ensuring-security-of-your-website/` | `/blog/secure-web-hosting-ensuring-security-of-your-website` | `/secure-web-hosting-ensuring-security-of-your-website/` | article, now a root route (like WordPress) |
| `/demystifying-ssl-https-for-business-website/` | `/blog/demystifying-ssl-https-for-business-website` | `/demystifying-ssl-https-for-business-website/` | article, now a root route (like WordPress) |
| `/5-best-payment-processing-app-for-your-website/` | `/blog/5-best-payment-processing-app-for-your-website` | `/5-best-payment-processing-app-for-your-website/` | article, now a root route (like WordPress) |
| `/how-to-build-e-commerce-website/` | `/blog/how-to-build-e-commerce-website` | `/how-to-build-e-commerce-website/` | article, now a root route (like WordPress) |
| `/what-is-ssl-certificate/` | `/blog/what-is-ssl-certificate` | `/what-is-ssl-certificate/` | article, now a root route (like WordPress) |
| `/when-dedicated-server-should-be-used-for-web-hosting/` | `/blog/when-dedicated-server-should-be-used-for-web-hosting` | `/when-dedicated-server-should-be-used-for-web-hosting/` | article, now a root route (like WordPress) |
| `/what-is-web-hosting/` | `/blog/what-is-web-hosting` | `/what-is-web-hosting/` | article, now a root route (like WordPress) |
| `/blogging-four-steps-guide-for-beginners/` | `/blog/blogging-four-steps-guide-for-beginners` | `/blogging-four-steps-guide-for-beginners/` | article, now a root route (like WordPress) |
| `/importance-of-taking-website-backup/` | `/blog/importance-of-taking-website-backup` | `/importance-of-taking-website-backup/` | article, now a root route (like WordPress) |
| `/taking-business-online-2-key-steps-after-shared-web-hosting/` | `/blog/taking-business-online-2-key-steps-after-shared-web-hosting` | `/taking-business-online-2-key-steps-after-shared-web-hosting/` | article, now a root route (like WordPress) |
| `/grow-your-business-even-in-the-days-of-lock-down-and-corona-pandemic-with-best-web-hosting/` | `/blog/grow-your-business-even-in-the-days-of-lock-down-and-corona-pandemic-with-best-web-hosting` | `/grow-your-business-even-in-the-days-of-lock-down-and-corona-pandemic-with-best-web-hosting/` | article, now a root route (like WordPress) |
| `/with-best-web-hosting-no-excuses-take-business-online/` | `/blog/with-best-web-hosting-no-excuses-take-business-online` | `/with-best-web-hosting-no-excuses-take-business-online/` | article, now a root route (like WordPress) |
| `/3-quick-steps-to-be-online-with-best-web-hosting-company/` | `/blog/3-quick-steps-to-be-online-with-best-web-hosting-company` | `/3-quick-steps-to-be-online-with-best-web-hosting-company/` | article, now a root route (like WordPress) |
| `/how-to-choose-best-seo-web-hosting/` | `/blog/how-to-choose-best-seo-web-hosting` | `/how-to-choose-best-seo-web-hosting/` | article, now a root route (like WordPress) |
| `/compare-web-hosting-plans-practical-guide-for-business-owners/` | `/blog/compare-web-hosting-plans-practical-guide-for-business-owners` | `/compare-web-hosting-plans-practical-guide-for-business-owners/` | article, now a root route (like WordPress) |
| `/why-you-need-domain-registration-for-online-business/` | `/blog/why-you-need-domain-registration-for-online-business` | `/why-you-need-domain-registration-for-online-business/` | article, now a root route (like WordPress) |
| `/what-is-domain-name-and-how-it-works/` | `/blog/what-is-domain-name-and-how-it-works` | `/what-is-domain-name-and-how-it-works/` | article, now a root route (like WordPress) |
| `/5-reasons-for-getting-ssl-certificate-for-your-website/` | `/blog/5-reasons-for-getting-ssl-certificate-for-your-website` | `/5-reasons-for-getting-ssl-certificate-for-your-website/` | article, now a root route (like WordPress) |
| `/here-are-the-reasons-for-taking-your-business-online/` | `/blog/here-are-the-reasons-for-taking-your-business-online` | `/here-are-the-reasons-for-taking-your-business-online/` | article, now a root route (like WordPress) |
| `/comparing-shared-vps-and-dedicated-hosting/` | `/blog/comparing-shared-vps-and-dedicated-hosting` | `/comparing-shared-vps-and-dedicated-hosting/` | article, now a root route (like WordPress) |
| `/website-speed-favors-your-google-ads/` | `/blog/website-speed-favors-your-google-ads` | `/website-speed-favors-your-google-ads/` | article, now a root route (like WordPress) |
| `/what-is-vps-web-hosting/` | `/blog/what-is-vps-web-hosting` | `/what-is-vps-web-hosting/` | article, now a root route (like WordPress) |
| `/your-customers-have-a-need-for-speedy-website/` | `/blog/your-customers-have-a-need-for-speedy-website` | `/your-customers-have-a-need-for-speedy-website/` | article, now a root route (like WordPress) |
| `/why-is-web-hosting-important-for-digital-marketing/` | `/blog/why-is-web-hosting-important-for-digital-marketing` | `/why-is-web-hosting-important-for-digital-marketing/` | article, now a root route (like WordPress) |
| `/business-is-always-a-race-where-you-need-to-outrun-your-competitors/` | `/blog/business-is-always-a-race-where-you-need-to-outrun-your-competitors` | `/business-is-always-a-race-where-you-need-to-outrun-your-competitors/` | article, now a root route (like WordPress) |
| `/what-is-user-experience-and-why-should-you-care/` | `/blog/what-is-user-experience-and-why-should-you-care` | `/what-is-user-experience-and-why-should-you-care/` | article, now a root route (like WordPress) |
| `/what-is-user-experience-and-why-should-you-care-2/` | `/blog/what-is-user-experience-and-why-should-you-care-2` | `/what-is-user-experience-and-why-should-you-care-2/` | article, now a root route (like WordPress) |
| `/why-your-site-needs-to-stay-up/` | `/blog/why-your-site-needs-to-stay-up` | `/why-your-site-needs-to-stay-up/` | article, now a root route (like WordPress) |
| `/` | `/` | `/` | same page, trailing slash added |
| `/resources/` | `301 → /blog` | `/resources/` | alias of /blog/ (canonical there) |
| `/sitemap/` | `/sitemap-page` | `/sitemap/` | served at the WordPress URL |
| `/web-hosting-cart/` | `/hosting` | `/web-hosting-cart/` | served at the WordPress URL |
| `/thank-you-for-subscribing/` | `301 → /thank-you` | `/thank-you-for-subscribing/` | alias of /thank-you/ (canonical there) |
| `/blog/` | `/blog` | `/blog/` | same page, trailing slash added |
| `/thank-you-for-interest-in-affiliate-program/` | `301 → /thank-you` | `/thank-you-for-interest-in-affiliate-program/` | alias of /thank-you/ (canonical there) |
| `/thank-you/` | `/thank-you` | `/thank-you/` | same page, trailing slash added |
| `/migration-status/` | `301 → /support` | `/migration-status/` | alias of /support/ (canonical there) |
| `/about-us-website-hosting-services/` | `/about-us` | `/about-us-website-hosting-services/` | served at the WordPress URL |
| `/become-our-affiliate/` | `/become-our-affiliate` | `/become-our-affiliate/` | same page, trailing slash added |
| `/50-off/` | `/promo/50-off` | `/50-off/` | served at the WordPress URL |
| `/business-email-hosting/` | `/email-hosting/business` | `/business-email-hosting/` | served at the WordPress URL |
| `/business-validated-certificates/` | `/ssl/business-validated` | `/business-validated-certificates/` | served at the WordPress URL |
| `/buy-web-hosting/` | `/hosting/buy-web-hosting` | `/buy-web-hosting/` | served at the WordPress URL |
| `/compare-hosting-plans/` | `/compare-hosting-plans` | `/compare-hosting-plans/` | same page, trailing slash added |
| `/contact-us/` | `/contact-us` | `/contact-us/` | same page, trailing slash added |
| `/dedicated-server-hosting/` | `/dedicated-hosting/dedicated-server` | `/dedicated-server-hosting/` | served at the WordPress URL |
| `/domain-hosting/` | `/domain/domain-hosting` | `/domain-hosting/` | served at the WordPress URL |
| `/domain-name-search-landing-page/` | `/domain/search` | `/domain-name-search-landing-page/` | served at the WordPress URL |
| `/domain-validated-certificate-with-sni-feature/` | `/ssl/domain-validated-sni` | `/domain-validated-certificate-with-sni-feature/` | served at the WordPress URL |
| `/domain-registration-india/` | `/domain/indian-domain` | `/domain-registration-india/` | served at the WordPress URL |
| `/privacy-policy/` | `/legal/privacy-policy` | `/privacy-policy/` | served at the WordPress URL |
| `/domain-validated-certificates/` | `/ssl/domain-validated` | `/domain-validated-certificates/` | served at the WordPress URL |
| `/extended-validated-certificates/` | `/ssl/extended-validated` | `/extended-validated-certificates/` | served at the WordPress URL |
| `/linux-dedicated-server-hosting/` | `/dedicated-hosting/linux-dedicated-server` | `/linux-dedicated-server-hosting/` | served at the WordPress URL |
| `/renew-your-domain/` | `/domain/renew` | `/renew-your-domain/` | served at the WordPress URL |
| `/buy-ssl-certificate/` | `/ssl` | `/buy-ssl-certificate/` | served at the WordPress URL |
| `/vps-hosting/` | `/vps-hosting` | `/vps-hosting/` | same page, trailing slash added |
| `/cheap-fast-reliable-seo-friendly-usa-web-hosting/` | `/hosting/usa-web-hosting` | `/cheap-fast-reliable-seo-friendly-usa-web-hosting/` | served at the WordPress URL |
| `/transfer-your-domain-name/` | `/domain/transfer-your-domain-name` | `/transfer-your-domain-name/` | served at the WordPress URL |
| `/wild-card-certificates/` | `/ssl/wildcard` | `/wild-card-certificates/` | served at the WordPress URL |
| `/wordpress-hosting/` | `/hosting/wordpress-hosting` | `/wordpress-hosting/` | served at the WordPress URL |
| `/web-hosting-bandwidth-calculator/` | `/tools/bandwidth-calculator` | `/web-hosting-bandwidth-calculator/` | served at the WordPress URL |
| `/buy-domain-name-at-cheap-price/` | `/domain/buy-domain-name` | `/buy-domain-name-at-cheap-price/` | served at the WordPress URL |
| `/domain-name-registration/` | `/domain/domain-name-registration` | `/domain-name-registration/` | served at the WordPress URL |
| `/enterprise-email-hosting/` | `/email-hosting/enterprise` | `/enterprise-email-hosting/` | served at the WordPress URL |
| `/mail-policy/` | `/legal/mail-policy` | `/mail-policy/` | served at the WordPress URL |
| `/acceptable-use-policy/` | `/legal/acceptable-use-policy` | `/acceptable-use-policy/` | served at the WordPress URL |
| `/affiliate-programme-terms/` | `/legal/affiliate-programme-terms` | `/affiliate-programme-terms/` | served at the WordPress URL |
| `/data-unit-calculator/` | `/tools/data-unit-calculator` | `/data-unit-calculator/` | served at the WordPress URL |
| `/download-upload-time-calculator/` | `/tools/transfer-time-calculator` | `/download-upload-time-calculator/` | served at the WordPress URL |
| `/resource-abuse-policy/` | `/legal/resource-abuse-policy` | `/resource-abuse-policy/` | served at the WordPress URL |
| `/terms-of-services/` | `/legal/terms-of-service` | `/terms-of-services/` | served at the WordPress URL |
| `/service-level-agreement/` | `/legal/service-level-agreement` | `/service-level-agreement/` | served at the WordPress URL |
| `/managed-dedicated-hosting-services/` | `/dedicated-hosting/managed-dedicated-server` | `/managed-dedicated-hosting-services/` | served at the WordPress URL |
| `/seo-hosting/` | `/hosting/seo-hosting` | `/seo-hosting/` | served at the WordPress URL |
| `/support/` | `/support` | `/support/` | same page, trailing slash added |
| `/unlimited-web-hosting-plans/` | `/hosting/unlimited-hosting` | `/unlimited-web-hosting-plans/` | served at the WordPress URL |
| `/linux-shared-hosting/` | `/hosting/linux-shared-hosting` | `/linux-shared-hosting/` | served at the WordPress URL |
| `/demo/` | `301 → /` | `/demo/` | alias of / (canonical there) |
| `/demo-2/` | `301 → /` | `/demo-2/` | alias of / (canonical there) |
| `/category/affiliate-marketing/` | `301 → merged topic` | `/category/affiliate-marketing/` | category archive page restored |
| `/category/blogging/` | `301 → merged topic` | `/category/blogging/` | category archive page restored |
| `/category/dedicated-hosting/` | `301 → merged topic` | `/category/dedicated-hosting/` | category archive page restored |
| `/category/digital-marketing/` | `301 → merged topic` | `/category/digital-marketing/` | category archive page restored |
| `/category/domain-name/` | `301 → merged topic` | `/category/domain-name/` | category archive page restored |
| `/category/email-hosting/` | `301 → merged topic` | `/category/email-hosting/` | category archive page restored |
| `/category/online-business/` | `301 → merged topic` | `/category/online-business/` | category archive page restored |
| `/category/secure-socket-layer-ssl/` | `301 → merged topic` | `/category/secure-socket-layer-ssl/` | category archive page restored |
| `/category/secure-web-hosting/` | `301 → merged topic` | `/category/secure-web-hosting/` | category archive page restored |
| `/category/shared-web-hosting-service/` | `301 → merged topic` | `/category/shared-web-hosting-service/` | category archive page restored |
| `/category/ssl-certificate/` | `301 → merged topic` | `/category/ssl-certificate/` | category archive page restored |
| `/category/web-designs/` | `301 → merged topic` | `/category/web-designs/` | category archive page restored |
| `/category/web-development/` | `301 → merged topic` | `/category/web-development/` | category archive page restored |
| `/category/web-hosting/` | `301 → merged topic` | `/category/web-hosting/` | category archive page restored |
| `/category/web-security/` | `301 → merged topic` | `/category/web-security/` | category archive page restored |
