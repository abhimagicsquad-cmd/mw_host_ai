import type { StructureResolver } from "sanity/structure"

const SINGLETONS = [
  { id: "siteSettings", title: "Site Settings" },
  { id: "navigation", title: "Navigation" },
  { id: "homePage", title: "Home Page" },
  { id: "aboutPage", title: "About Page" },
  { id: "contactPage", title: "Contact Page" },
  { id: "supportPage", title: "Support Page" },
  { id: "affiliatePage", title: "Affiliate Page" },
  { id: "comparisonPage", title: "Compare Hosting Plans Page" },
  { id: "knowledgeBasePage", title: "Knowledge Base Page" },
  { id: "thankYouPage", title: "Thank You Page" },
  { id: "blogListingPage", title: "Blog Listing Page" },
]

const SINGLETON_TYPES = new Set(SINGLETONS.map((s) => s.id))

/** Pins singletons at the top of the Studio nav and hides them from the generic document-type lists below. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map(({ id, title }) => S.listItem().title(title).id(id).child(S.document().schemaType(id).documentId(id))),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.has(item.getId() ?? "")),
    ])
