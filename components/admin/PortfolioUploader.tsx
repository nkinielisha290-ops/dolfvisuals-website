"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { CATEGORIES } from "@/lib/i18n";
import { imageSize, prepareImage, uploadMedia } from "@/lib/supabase/browser";
import { addPortfolioItems } from "@/app/admin/actions";

export default function PortfolioUploader() {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [progress, setProgress] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setErr(null);
    const items = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const f = await prepareImage(files[i]);
        const { width, height } = await imageSize(f);
        const image_url = await uploadMedia(f, `portfolio/${category}`);
        items.push({ image_url, width, height, category, title_en: files[i].name.replace(/\.\w+$/, "").replace(/[-_]+/g, " ") });
      }
      setProgress("Saving…");
      const e = await addPortfolioItems(items);
      if (e) throw new Error(e);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-dashed border-ink/25 bg-white p-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium">Category for these photos
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="a-input mt-1 min-w-60">
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.en}</option>)}
          </select>
        </label>
        <label className={`a-btn cursor-pointer ${progress ? "pointer-events-none opacity-60" : ""}`}>
          {progress ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {progress ?? "Upload photos"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        </label>
      </div>
      <p className="mt-3 text-xs text-ink/50">Select several photos at once. Large photos are resized automatically. For videos, use “Add portfolio item” and paste a YouTube link.</p>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
