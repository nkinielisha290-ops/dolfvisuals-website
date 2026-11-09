"use client";
import { createBrowserClient } from "@supabase/ssr";
import { MEDIA_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;
export function supabaseBrowser() {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

/** Upload a file straight from the browser to the public media bucket. */
export async function uploadMedia(file: File, folder: string) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = supabaseBrowser();
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw error;
  return sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl as string;
}

/** Read an image's natural size in the browser. */
export function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
    img.onerror = () => resolve({ width: 1200, height: 1500 });
    img.src = URL.createObjectURL(file);
  });
}

/** Downscale big photos before upload (keeps quality, saves bandwidth). */
export async function prepareImage(file: File, max = 2400): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const { width, height } = await imageSize(file);
  if (Math.max(width, height) <= max && file.size < 3_000_000) return file;
  const scale = Math.min(1, max / Math.max(width, height));
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/webp", 0.88));
  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
}
