import type { Permission } from "@/lib/admin/permissions"

export type AdminNavIcon =
  | "dashboard"
  | "pages"
  | "content"
  | "media"
  | "seo"
  | "menus"
  | "forms"
  | "users"
  | "settings"
  | "activity"

export type AdminNavLink = { label: string; href: string; permission?: Permission }

export type AdminNavItem = {
  label: string
  icon: AdminNavIcon
  href?: string
  permission?: Permission
  children?: AdminNavLink[]
}

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
  {
    label: "Pages",
    icon: "pages",
    children: [
      { label: "All Pages", href: "/admin/pages" },
      { label: "Add New Page", href: "/admin/pages/new", permission: "pages.edit" },
      { label: "Draft Pages", href: "/admin/pages/drafts" },
    ],
  },
  {
    label: "Content",
    icon: "content",
    children: [
      { label: "Home Page", href: "/admin/content/home" },
      { label: "Service Pages", href: "/admin/content/service" },
      { label: "Product Pages", href: "/admin/content/product" },
      { label: "Category Pages", href: "/admin/content/category" },
      { label: "Static Pages", href: "/admin/content/static" },
      { label: "Blog Posts", href: "/admin/content/blog" },
    ],
  },
  {
    label: "Media Library",
    icon: "media",
    children: [
      { label: "Images", href: "/admin/media/images" },
      { label: "Icons", href: "/admin/media/icons" },
      { label: "Documents", href: "/admin/media/documents" },
      { label: "Upload Media", href: "/admin/media/upload", permission: "media.manage" },
    ],
  },
  {
    label: "SEO",
    icon: "seo",
    permission: "seo.manage",
    children: [
      { label: "Meta Titles", href: "/admin/seo/titles" },
      { label: "Meta Descriptions", href: "/admin/seo/descriptions" },
      { label: "Schema", href: "/admin/seo/schema" },
      { label: "Open Graph", href: "/admin/seo/open-graph" },
    ],
  },
  {
    label: "Menus",
    icon: "menus",
    permission: "menus.manage",
    children: [
      { label: "Header Menu", href: "/admin/menus/header" },
      { label: "Footer Menu", href: "/admin/menus/footer" },
    ],
  },
  {
    label: "Forms",
    icon: "forms",
    permission: "forms.view",
    children: [
      { label: "Leads", href: "/admin/forms/leads" },
      { label: "Form Entries", href: "/admin/forms/entries" },
    ],
  },
  {
    label: "Users",
    icon: "users",
    permission: "users.manage",
    children: [
      { label: "Admin Users", href: "/admin/users" },
      { label: "Roles & Permissions", href: "/admin/users/roles" },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    permission: "settings.manage",
    children: [
      { label: "General Settings", href: "/admin/settings/general" },
      { label: "Website Settings", href: "/admin/settings/website" },
    ],
  },
  { label: "Activity Logs", icon: "activity", href: "/admin/activity", permission: "activity.view" },
]
