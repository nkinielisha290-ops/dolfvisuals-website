"use client";
import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { imageSize, prepareImage, uploadMedia } from "@/lib/supabase/browser";

export default function ImageField({ name, defaultValue, folder, required, withSize }: {
  name: string; defaultValue?: string | null; folder: string; required?: boolean; withSize?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const prepared = await prepareImage(file);
      const dims = await imageSize(prepared);
      setUrl(await uploadMedia(prepared, folder));
      setSize(dims);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1">
      <input type="hidden" name={name} value={url} required={required} />
      {withSize && size && (<><input type="hidden" name="width" value={size.width} /><input type="hidden" name="height" value={size.height} /></>)}
      <div className="flex items-start gap-4">
        <div className="relative grid size-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-ink/20 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" className="size-full object-cover" /> : <ImagePlus className="size-7 text-ink/30" />}
          {busy && <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="size-6 animate-spin" /></div>}
        </div>
        <div className="space-y-2 text-sm">
          <label className="a-btn-ghost cursor-pointer">
            <ImagePlus className="size-4" /> {url ? "Replace" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {url && <button type="button" onClick={() => setUrl("")} className="flex items-center gap-1 text-xs text-red-600"><X className="size-3" /> Remove</button>}
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}
