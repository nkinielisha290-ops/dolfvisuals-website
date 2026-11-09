"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { BOOKING_STATUSES, INQUIRY_STATUSES, RESOURCES } from "@/lib/admin-resources";

async function admin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("is_admin");
  if (!ok) throw new Error("Not authorised");
  return sb;
}
const refresh = () => revalidatePath("/", "layout");

export async function signIn(_: string | null, fd: FormData): Promise<string | null> {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  });
  if (error) return error.message;
  redirect("/admin");
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/admin/login");
}

function parse(resourceKey: string, fd: FormData) {
  const r = RESOURCES[resourceKey];
  if (!r) throw new Error("Unknown resource");
  const row: Record<string, unknown> = {};
  for (const f of r.fields) {
    const raw = fd.get(f.name);
    const v = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "checkbox": row[f.name] = fd.get(f.name) === "on"; break;
      case "number": row[f.name] = v === "" ? (f.name === "sort" ? 0 : null) : Number(v.replace(/[^\d.-]/g, "")); break;
      case "list": row[f.name] = v ? v.split("\n").map((x) => x.trim()).filter(Boolean) : []; break;
      case "slug": row[f.name] = v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); break;
      default: row[f.name] = v === "" ? null : v;
    }
    if (f.required && (row[f.name] === null || row[f.name] === "")) throw new Error(`${f.label} is required`);
  }
  for (const k of ["width", "height"]) {
    const v = fd.get(k);
    if (v) row[k] = Number(v);
  }
  return { r, row };
}

export async function saveRecord(resourceKey: string, id: string, _: string | null, fd: FormData): Promise<string | null> {
  try {
    const sb = await admin();
    const { r, row } = parse(resourceKey, fd);
    // keep NOT NULL text columns safe
    for (const [k, v] of Object.entries(row)) if (v === null && /_(sw|en)$/.test(k) && !/^(description|bio|price_note|quote_sw)/.test(k)) row[k] = "";
    const q = id === "new" ? sb.from(r.table).insert(row) : sb.from(r.table).update(row).eq("id", id);
    const { error } = await q;
    if (error) return error.message;
  } catch (e) {
    return (e as Error).message;
  }
  refresh();
  redirect(`/admin/${resourceKey}`);
}

export async function deleteRecord(resourceKey: string, id: string) {
  const sb = await admin();
  const r = RESOURCES[resourceKey];
  await sb.from(r.table).delete().eq("id", id);
  refresh();
  redirect(`/admin/${resourceKey}`);
}

export async function togglePublished(resourceKey: string, id: string, field: string, value: boolean) {
  const sb = await admin();
  const r = RESOURCES[resourceKey];
  if (!r.fields.some((f) => f.name === field && f.type === "checkbox")) return;
  await sb.from(r.table).update({ [field]: value }).eq("id", id);
  refresh();
  revalidatePath(`/admin/${resourceKey}`);
}

export async function addPortfolioItems(items: { image_url: string; width: number; height: number; category: string; title_en: string }[]) {
  const sb = await admin();
  const { data: last } = await sb.from("portfolio_items").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
  let sort = (last?.sort ?? 0) + 1;
  const rows = items.map((i) => ({ ...i, title_sw: "", media_type: "image", sort: sort++, published: true }));
  const { error } = await sb.from("portfolio_items").insert(rows);
  if (error) return error.message;
  refresh();
  revalidatePath("/admin/portfolio");
  return null;
}

export async function updateBooking(id: string, fd: FormData) {
  const sb = await admin();
  const status = String(fd.get("status"));
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) return;
  await sb.from("bookings").update({ status, admin_notes: String(fd.get("admin_notes") ?? "") || null }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteBooking(id: string) {
  const sb = await admin();
  await sb.from("bookings").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function updateInquiry(id: string, status: string) {
  const sb = await admin();
  if (!(INQUIRY_STATUSES as readonly string[]).includes(status)) return;
  await sb.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteInquiry(id: string) {
  const sb = await admin();
  await sb.from("inquiries").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

const SETTINGS_FIELDS = [
  "tagline_en", "tagline_sw", "hero_title_en", "hero_title_sw", "hero_subtitle_en", "hero_subtitle_sw",
  "phone", "whatsapp", "email", "location_en", "location_sw", "instagram", "facebook", "tiktok", "youtube", "linkedin",
  "hero_video_url", "hero_video_mobile_url",
];

export async function saveSettings(_: string | null, fd: FormData): Promise<string | null> {
  const sb = await admin();
  const row: Record<string, string | null> = {};
  for (const k of SETTINGS_FIELDS) {
    const v = String(fd.get(k) ?? "").trim();
    row[k] = v || (["instagram", "facebook", "tiktok", "youtube", "linkedin", "hero_video_url", "hero_video_mobile_url"].includes(k) ? null : "");
  }
  if (row.whatsapp) row.whatsapp = row.whatsapp.replace(/[^\d]/g, "");
  const { error } = await sb.from("settings").upsert({ id: 1, ...row, updated_at: new Date().toISOString() });
  if (error) return error.message;
  refresh();
  return "saved";
}
