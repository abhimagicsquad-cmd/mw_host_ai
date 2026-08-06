# WordPress → Next.js Route Mapping

All new routes drop the trailing slash (Next.js default) and old URLs 301-redirect via `middleware.ts` to preserve SEO equity. Sanity `slug` fields should be set to match the **New Route** column exactly (minus leading `/`) so no redirect table needs to be hand-maintained beyond this doc.

## Core Pages
| WordPress URL | New Next.js Route | Notes |
|---|---|---|
| `/` | `/` | Homepage |
| `/about-us-website-hosting-services/` | `/about-us` | Shortened slug |
| `/contact-us/` | `/contact-us` | |
| `/support/` | `/support` | |
| `/become-our-affiliate/` | `/become-our-affiliate` | |
| `/resources/` | `/blog` (301) | Merge alias into single blog hub — eliminates duplicate-content pair found in audit |
| `/sitemap/` | `/sitemap-page` | Renamed to avoid clashing with `/sitemap.xml` |
| `/blog/` | `/blog` | |
| `/compare-hosting-plans/` | `/compare-hosting-plans` | **Content decision needed**: audit found no real competitor data exists today — either build real comparison data or fold this into `/hosting/buy-web-hosting` as a section |
| `/50-off/` | `/promo/50-off` | Generalized under `/promo/[campaignSlug]` for future reuse |
| `/web-hosting-cart/` | `/hosting/buy-web-hosting` (301) | Duplicate of buy-web-hosting content — merge |
| `/migration-status/` | *(drop — do not port)* | Flagged in audit as orphaned/placeholder; confirm manually, then 410/omit |

## Hosting Plan Pages → `/hosting/[slug]`
| WordPress URL | New Route |
|---|---|
| `/buy-web-hosting/` | `/hosting/buy-web-hosting` |
| `/unlimited-web-hosting-plans/` | `/hosting/unlimited-web-hosting` |
| `/seo-hosting/` | `/hosting/seo-hosting` |
| `/wordpress-hosting/` | `/hosting/wordpress-hosting` |
| `/linux-shared-hosting/` | `/hosting/linux-shared-hosting` |
| `/cheap-fast-reliable-seo-friendly-usa-web-hosting/` | `/hosting/usa-web-hosting` | Rename slug; reconcile pricing bug noted in audit before publishing |

## VPS & Dedicated → separate top-level + `/dedicated-hosting/[slug]`
| WordPress URL | New Route | Notes |
|---|---|---|
| `/vps-hosting/` | `/vps-hosting` | Standalone (only one VPS page exists) |
| `/dedicated-server-hosting/` | `/dedicated-hosting/dedicated-server` | |
| `/managed-dedicated-hosting-services/` | `/dedicated-hosting/managed-dedicated` | Same underlying Sanity doc as above with `managed:true`, or a clearly differentiated doc if content is deliberately split — decide during content entry |
| `/linux-dedicated-server-hosting/` | `/dedicated-hosting/linux-dedicated-server` | |

## Domain Pages → `/domain/[slug]`
| WordPress URL | New Route |
|---|---|
| `/domain-hosting/` | `/domain/domain-hosting` |
| `/domain-name-search-landing-page/` | `/domain/search` | Confirm real search functionality before/after launch (see audit §12.5) |
| `/domain-registration-india/` | `/domain/india-domains` |
| `/domain-name-registration/` | `/domain/register` |
| `/buy-domain-name-at-cheap-price/` | `/domain/buy-cheap-domain` |
| `/transfer-your-domain-name/` | `/domain/transfer` |
| `/renew-your-domain/` | `/domain/renew` |

## SSL Pages → `/ssl` + `/ssl/[slug]`
| WordPress URL | New Route |
|---|---|
| `/buy-ssl-certificate/` | `/ssl` (pillar page) |
| `/business-validated-certificates/` | `/ssl/business-validated` |
| `/domain-validated-certificate-with-sni-feature/` | `/ssl/domain-validated-sni` |
| `/domain-validated-certificates/` | `/ssl/domain-validated` |
| `/extended-validated-certificates/` | `/ssl/extended-validated` |
| `/wild-card-certificates/` | `/ssl/wildcard` |

## Email Pages → `/email-hosting/[slug]`
| WordPress URL | New Route |
|---|---|
| `/business-email-hosting/` | `/email-hosting/business` |
| `/enterprise-email-hosting/` | `/email-hosting/enterprise` |

## Tools
| WordPress URL | New Route |
|---|---|
| `/web-hosting-bandwidth-calculator/` | `/tools/bandwidth-calculator` |
| `/data-unit-calculator/` | `/tools/data-unit-calculator` |
| `/download-upload-time-calculator/` | `/tools/transfer-time-calculator` |

## Thank-You Pages → consolidated single route
| WordPress URL | New Route |
|---|---|
| `/thank-you/` | `/thank-you?type=contact` |
| `/thank-you-for-subscribing/` | `/thank-you?type=newsletter` |
| `/thank-you-for-interest-in-affiliate-program/` | `/thank-you?type=affiliate` |

## Legal Pages → `/legal/[slug]`
| WordPress URL | New Route |
|---|---|
| `/privacy-policy/` | `/legal/privacy-policy` |
| `/mail-policy/` | `/legal/mail-policy` |
| `/acceptable-use-policy/` | `/legal/acceptable-use-policy` |
| `/resource-abuse-policy/` | `/legal/resource-abuse-policy` |
| `/terms-of-services/` | `/legal/terms-of-service` |
| `/service-level-agreement/` | `/legal/sla` |
| `/affiliate-programme-terms/` | `/legal/affiliate-terms` |

## Blog
| WordPress pattern | New Route pattern |
|---|---|
| `/blog/` (index, page N) | `/blog?page=N` or `/blog/page/N` |
| `/{post-slug}/` (42 posts, flat WP permalink) | `/blog/{post-slug}` — **every post moves under `/blog/`, requiring a full redirect map** (see Appendix below) |
| `/category/{category}/` (15 archives) | `/blog/category/{category}` |

**Appendix — full flat-permalink blog post list (all 42 follow `/{slug}/` → `/blog/{slug}` 1:1):**
`how-to-use-wordpress-to-build-your-online-presence`, `how-to-create-a-website`, `best-hosting-for-affiliate-marketing`, `market-your-business-with-professional-email-address`, `do-not-take-malware-lightly-it-can-ruin-your-business`, `want-to-know-different-types-of-ssl-certificates-for-webhosting`, `moments-of-truth-mot-for-digital-marketer`, `cannot-ignore-webpage-loading-time`, `why-you-should-care-about-website-uptime`, `improve-webpage-speed-and-boost-your-digital-business`, `take-website-security-seriously-it-affects-seo`, `need-faster-website-because-slow-website-kill-conversions`, `when-to-choose-shared-web-hosting-service`, `are-you-curious-about-types-of-web-hosting`, `secure-web-hosting-ensuring-security-of-your-website`, `demystifying-ssl-https-for-business-website`, `5-best-payment-processing-app-for-your-website`, `how-to-build-e-commerce-website`, `what-is-ssl-certificate`, `when-dedicated-server-should-be-used-for-web-hosting`, `what-is-web-hosting`, `blogging-four-steps-guide-for-beginners`, `importance-of-taking-website-backup`, `taking-business-online-2-key-steps-after-shared-web-hosting`, `grow-your-business-even-in-the-days-of-lock-down-and-corona-pandemic-with-best-web-hosting`, `with-best-web-hosting-no-excuses-take-business-online`, `3-quick-steps-to-be-online-with-best-web-hosting-company`, `how-to-choose-best-seo-web-hosting`, `compare-web-hosting-plans-practical-guide-for-business-owners`, `why-you-need-domain-registration-for-online-business`, `what-is-domain-name-and-how-it-works`, `5-reasons-for-getting-ssl-certificate-for-your-website`, `here-are-the-reasons-for-taking-your-business-online`, `comparing-shared-vps-and-dedicated-hosting`, `website-speed-favors-your-google-ads`, `what-is-vps-web-hosting`, `your-customers-have-a-need-for-speedy-website`, `why-is-web-hosting-important-for-digital-marketing`, `business-is-always-a-race-where-you-need-to-outrun-your-competitors`, `what-is-user-experience-and-why-should-you-care`, `what-is-user-experience-and-why-should-you-care-2` (duplicate topic — consider merging/redirecting into the first), `why-your-site-needs-to-stay-up`

**Categories (15):** affiliate-marketing, blogging, dedicated-hosting, digital-marketing, domain-name, email-hosting, online-business, secure-socket-layer-ssl, secure-web-hosting, shared-web-hosting-service, ssl-certificate, web-designs, web-development, web-hosting, web-security

## External / unchanged (not migrated — remain on WHMCS)
`/clients/cart.php`, `/clients/clientarea.php`, `/clients/knowledgebase.php`, `/clients/domainchecker.php`, `/clients/announcements.php` — all preserved as external links from the Next.js site; **query parameters (`pid`, `promocode`, `billingcycle`) must be carried over exactly** as documented in the audit's pricing tables.
