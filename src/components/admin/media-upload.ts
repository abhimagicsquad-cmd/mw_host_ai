"use client"

import { finalizeUploadAction, prepareUploadAction } from "@/lib/admin/actions/media"
import type { MediaFolder } from "@/lib/cms/types"

export const ACCEPTED_MEDIA = ".jpg,.jpeg,.png,.svg,.webp,.pdf,image/jpeg,image/png,image/svg+xml,image/webp,application/pdf"

function putWithProgress(url: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("content-type", file.type)
    xhr.setRequestHeader("x-upsert", "true")
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)))
    xhr.onerror = () => reject(new Error("Network error during upload"))
    xhr.send(file)
  })
}

/** Signed-URL upload: ask the server for a URL, PUT the bytes straight to storage, then register the file. */
export async function uploadMediaFile(
  file: File,
  options: { folder?: MediaFolder | "auto"; replaceId?: string; onProgress?: (fraction: number) => void }
): Promise<{ error?: string }> {
  const prepared = await prepareUploadAction({
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    folder: options.folder ?? "auto",
    replaceId: options.replaceId,
  })
  if (prepared.error || !prepared.upload) return { error: prepared.error ?? "Upload could not start." }

  try {
    await putWithProgress(prepared.upload.signedUrl, file, options.onProgress ?? (() => {}))
  } catch (error) {
    return { error: `${file.name}: ${(error as Error).message}` }
  }

  const finalized = await finalizeUploadAction({
    path: prepared.upload.path,
    fileName: file.name,
    folder: prepared.upload.folder,
    replaceId: options.replaceId,
  })
  return { error: finalized.error }
}
