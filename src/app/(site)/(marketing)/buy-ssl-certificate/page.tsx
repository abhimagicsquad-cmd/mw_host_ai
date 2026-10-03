/**
 * The WordPress URL of the SSL hub, as a real route. A rewrite to /ssl works for page loads but
 * breaks Next's segment prefetch for this URL (it resolves against the root catch-all first),
 * so the page is re-exported here instead. /ssl 308s here (src/lib/public-paths.ts).
 */
export { default, generateMetadata } from "../ssl/page"
