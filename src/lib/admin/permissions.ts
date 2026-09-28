import type { AdminRole } from "@/lib/cms/types"

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "Full access, including user management and site settings.",
  admin: "Manages all content, SEO, menus, media, forms and settings. Cannot manage users.",
  editor: "Creates and edits pages, content, media and SEO. Cannot delete pages, view leads, change settings or manage users.",
}

export type Permission =
  | "pages.edit"
  | "pages.publish"
  | "pages.delete"
  | "media.manage"
  | "seo.manage"
  | "menus.manage"
  | "forms.view"
  | "users.manage"
  | "settings.manage"
  | "activity.view"
  | "system.import"

export const PERMISSION_LABELS: Record<Permission, string> = {
  "pages.edit": "Create & edit pages and content",
  "pages.publish": "Publish / unpublish pages",
  "pages.delete": "Delete pages",
  "media.manage": "Upload, replace & delete media",
  "seo.manage": "Manage SEO, Open Graph & schema",
  "menus.manage": "Edit header & footer menus",
  "forms.view": "View leads & form entries",
  "users.manage": "Create, edit & delete admin users",
  "settings.manage": "Change general & website settings",
  "activity.view": "View activity logs",
  "system.import": "Import content from Sanity & clear site cache",
}

const MATRIX: Record<AdminRole, Permission[]> = {
  super_admin: Object.keys(PERMISSION_LABELS) as Permission[],
  admin: [
    "pages.edit",
    "pages.publish",
    "pages.delete",
    "media.manage",
    "seo.manage",
    "menus.manage",
    "forms.view",
    "settings.manage",
    "activity.view",
    "system.import",
  ],
  editor: ["pages.edit", "pages.publish", "media.manage", "seo.manage", "menus.manage"],
}

export function can(role: AdminRole, permission: Permission): boolean {
  return MATRIX[role]?.includes(permission) ?? false
}

export const ALL_ROLES: AdminRole[] = ["super_admin", "admin", "editor"]
