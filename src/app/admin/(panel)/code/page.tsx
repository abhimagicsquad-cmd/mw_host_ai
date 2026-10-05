import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/admin/auth"

export default async function CustomCodeIndexPage() {
  await requireAdmin("code.manage")
  redirect("/admin/code/head")
}
