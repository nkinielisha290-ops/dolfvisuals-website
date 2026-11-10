"use client";
import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadMedia } from "@/lib/supabase/browser";

function VideoUrl({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="mt-1 space-y-2">
      <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…mp4" className="a-input" />
      <label className={`a-btn-ghost cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} {busy ? "Uploading…" : "Upload MP4"}
        <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setBusy(true); setErr(null);
          try { setUrl(await uploadMedia(f, "showreel")); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
        }} />
      </label>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <p className="text-xs text-ink/50">Tip: 10–30 seconds, no audio, under ~8 MB loads fastest.</p>
    </div>
  );
}

const groups: { title: string; fields: [keyof Settings, string, ("textarea" | "text")?][] }[] = [
  { title: "Home page", fields: [
    ["hero_title_en", "Headline (English)"], ["hero_title_sw", "Headline (Kiswahili)"],
    ["hero_subtitle_en", "Intro text (English)", "textarea"], ["hero_subtitle_sw", "Intro text (Kiswahili)", "textarea"],
    ["tagline_en", "Tagline (English)"], ["tagline_sw", "Tagline (Kiswahili)"],
  ] },
  { title: "Contact details", fields: [
    ["phone", "Phone number"], ["whatsapp", "WhatsApp number (with country code, e.g. 255756506908)"],
    ["email", "Email"], ["location_en", "Location (English)"], ["location_sw", "Location (Kiswahili)"],
  ] },
  { title: "Showreel video (optional — shown in Portfolio → Films)", fields: [
    ["hero_video_url", "Showreel video URL (MP4). Shown on the Portfolio page only when set"],
  ] },
  { title: "Social media links", fields: [
    ["instagram", "Instagram URL"], ["facebook", "Facebook URL"], ["tiktok", "TikTok URL"], ["youtube", "YouTube URL"], ["linkedin", "LinkedIn URL"], ["x", "X (Twitter) URL"],
  ] },
];

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action} className="max-w-4xl space-y-6">
      {groups.map((g) => (
        <fieldset key={g.title} className="grid gap-5 rounded-xl border border-ink/10 bg-white p-6 sm:grid-cols-2">
          <legend className="px-1 font-heading font-bold">{g.title}</legend>
          {g.fields.map(([name, label, type]) => (
            <label key={name} className={type === "textarea" ? "sm:col-span-1" : ""}>
              <span className="text-sm font-medium">{label}</span>
              {type === "textarea"
                ? <textarea name={name} defaultValue={String(settings[name] ?? "")} rows={3} className="a-input mt-1" />
                : name.startsWith("hero_video") ? <VideoUrl name={name} defaultValue={String(settings[name] ?? "")} />
                : <input name={name} defaultValue={String(settings[name] ?? "")} className="a-input mt-1" />}
            </label>
          ))}
        </fieldset>
      ))}
      <div className="flex items-center gap-3">
        <button disabled={pending} className="a-btn">{pending && <Loader2 className="size-4 animate-spin" />} Save settings</button>
        {state === "saved" && <span className="flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 className="size-4" /> Saved — the website is updated.</span>}
        {state && state !== "saved" && <span className="text-sm text-red-600">{state}</span>}
      </div>
    </form>
  );
}
