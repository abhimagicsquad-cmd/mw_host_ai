/**
 * The WordPress URL of the About page, as a real route. A rewrite to /about-us works for page
 * loads but breaks Next's segment prefetch for this URL (it resolves against the root
 * catch-all first), so the page is re-exported here instead. /about-us 308s here.
 */
export { default, generateMetadata } from "../about-us/page"
