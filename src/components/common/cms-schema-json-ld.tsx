import { getSeoOverride } from "@/lib/cms/content"

/** Renders the custom schema.org JSON-LD saved for `path` in the admin (SEO → Schema), if any. */
export async function CmsSchemaJsonLd({ path }: { path: string }) {
  const seo = await getSeoOverride(path)
  if (!seo?.schema_json || typeof seo.schema_json !== "object") return null

  // Escape "<" so admin-entered strings can never close the <script> element.
  const json = JSON.stringify(seo.schema_json).replace(/</g, "\\u003c")
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
