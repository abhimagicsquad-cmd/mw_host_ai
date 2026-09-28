"use server"

import { randomBytes } from "node:crypto"
import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { slugify } from "@/lib/cms/paths"
import type { ActionState, MediaFolder } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

/**
 * Uploads go browser → Supabase Storage directly through a short-lived signed URL, so file
 * size isn't bound by the serverless request-body limit. The server only (1) authorizes and
 * hands out the signed URL and (2) verifies the stored object before recording it.
 */

const BUCKET = "cms-media"
const MAX_BYTES = 20 * 1024 * 1024
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "application/pdf": "pdf",
}

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

async function ensureBucket() {
  const storage = db().storage
  const { data } = await storage.getBucket(BUCKET)
  if (data) return
  const { error } = await storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: Object.keys(ALLOWED),
  })
  if (error && !/already exists/i.test(error.message)) throw error
}

function defaultFolder(mimeType: string): MediaFolder {
  if (mimeType === "application/pdf") return "documents"
  if (mimeType === "image/svg+xml") return "icons"
  return "images"
}

const prepareSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().int().positive(),
  folder: z.enum(["auto", "images", "icons", "documents"]).default("auto"),
  replaceId: z.uuid().optional(),
})

export type PreparedUpload = { signedUrl: string; path: string; folder: MediaFolder; token: string }

export async function prepareUploadAction(input: z.input<typeof prepareSchema>): Promise<ActionState & { upload?: PreparedUpload }> {
  try {
    await authorizeAction("media.manage")
    const parsed = prepareSchema.safeParse(input)
    if (!parsed.success) return { error: "Invalid upload request." }
    const { fileName, mimeType, size, replaceId } = parsed.data

    const ext = ALLOWED[mimeType]
    if (!ext) return { error: `${fileName}: only JPG, PNG, SVG, WEBP and PDF files are allowed.` }
    if (size > MAX_BYTES) return { error: `${fileName}: files must be 20 MB or smaller.` }

    await ensureBucket()

    let path: string
    let folder: MediaFolder
    if (replaceId) {
      const { data: existing, error } = await db().from("media").select("storage_path, folder, mime_type").eq("id", replaceId).single()
      if (error) throw error
      if (ALLOWED[existing.mime_type] !== ext) return { error: `Replacement must be the same file type (${ALLOWED[existing.mime_type]?.toUpperCase()}).` }
      path = existing.storage_path
      folder = existing.folder
    } else {
      folder = parsed.data.folder === "auto" ? defaultFolder(mimeType) : parsed.data.folder
      const base = slugify(fileName.replace(/\.[^.]+$/, "")).slice(0, 60) || "file"
      const now = new Date()
      path = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${base}-${randomBytes(4).toString("hex")}.${ext}`
    }

    const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path, { upsert: Boolean(replaceId) })
    if (error) throw error
    return { ok: true, upload: { signedUrl: data.signedUrl, path, folder, token: data.token } }
  } catch (error) {
    return toActionError(error)
  }
}

const finalizeSchema = z.object({
  path: z.string().min(1),
  fileName: z.string().min(1).max(255),
  folder: z.enum(["images", "icons", "documents"]),
  replaceId: z.uuid().optional(),
})

export async function finalizeUploadAction(input: z.input<typeof finalizeSchema>): Promise<ActionState> {
  try {
    const admin = await authorizeAction("media.manage")
    const parsed = finalizeSchema.safeParse(input)
    if (!parsed.success) return { error: "Invalid upload." }
    const { path, fileName, folder, replaceId } = parsed.data

    const { data: info, error: infoError } = await db().storage.from(BUCKET).info(path)
    if (infoError || !info) return { error: `${fileName}: upload could not be verified. Please retry.` }
    const mimeType = info.contentType ?? "application/octet-stream"
    if (!ALLOWED[mimeType]) {
      await db().storage.from(BUCKET).remove([path])
      return { error: `${fileName}: unsupported file type.` }
    }

    const publicUrl = db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    const now = new Date().toISOString()

    if (replaceId) {
      // Cache-bust: same object path, new URL so browsers/CDNs fetch the new file.
      const { error } = await db()
        .from("media")
        .update({ public_url: `${publicUrl}?v=${Date.now()}`, size_bytes: info.size ?? 0, mime_type: mimeType, updated_at: now })
        .eq("id", replaceId)
      if (error) throw error
      await logActivity({ admin, action: "media.replaced", entityType: "media", entityId: replaceId, description: `Replaced media file “${fileName}”` })
      refreshWebsite()
      return { ok: true, message: "File replaced." }
    }

    const { data, error } = await db()
      .from("media")
      .insert({
        file_name: fileName,
        storage_path: path,
        public_url: publicUrl,
        mime_type: mimeType,
        size_bytes: info.size ?? 0,
        folder,
        uploaded_by: actorId(admin),
      })
      .select("id")
      .single()
    if (error) throw error

    await logActivity({ admin, action: "media.uploaded", entityType: "media", entityId: data.id, description: `Uploaded “${fileName}” to ${folder}` })
    return { ok: true, message: "Uploaded." }
  } catch (error) {
    return toActionError(error)
  }
}

export type PickerMedia = { id: string; file_name: string; public_url: string; mime_type: string; folder: MediaFolder; alt_text: string | null }

/** Lightweight library listing for the in-editor media picker. */
export async function listMediaForPickerAction(): Promise<{ items: PickerMedia[]; error?: string }> {
  try {
    await authorizeAction("pages.edit")
    const { data, error } = await db()
      .from("media")
      .select("id, file_name, public_url, mime_type, folder, alt_text")
      .order("created_at", { ascending: false })
      .limit(500)
    if (error) throw error
    return { items: (data as PickerMedia[]) ?? [] }
  } catch (error) {
    return { items: [], error: toActionError(error).error }
  }
}

const updateSchema = z.object({
  file_name: z.string().trim().min(1, "Name is required").max(255),
  alt_text: z.string().trim().max(500).optional(),
  folder: z.enum(["images", "icons", "documents"]),
})

export async function updateMediaAction(mediaId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("media.manage")
    const parsed = updateSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const { error } = await db()
      .from("media")
      .update({ ...parsed.data, alt_text: parsed.data.alt_text || null, updated_at: new Date().toISOString() })
      .eq("id", mediaId)
    if (error) throw error
    await logActivity({ admin, action: "media.updated", entityType: "media", entityId: mediaId, description: `Updated details of “${parsed.data.file_name}”` })
    return { ok: true, message: "Saved." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteMediaAction(mediaId: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("media.manage")
    const { data, error } = await db().from("media").select("storage_path, file_name").eq("id", mediaId).single()
    if (error) throw error
    const { error: storageError } = await db().storage.from(BUCKET).remove([data.storage_path])
    if (storageError) throw storageError
    const { error: deleteError } = await db().from("media").delete().eq("id", mediaId)
    if (deleteError) throw deleteError
    await logActivity({ admin, action: "media.deleted", entityType: "media", entityId: mediaId, description: `Deleted media file “${data.file_name}”` })
    refreshWebsite()
    return { ok: true, message: "File deleted." }
  } catch (error) {
    return toActionError(error)
  }
}
