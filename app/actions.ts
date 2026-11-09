"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { supabasePublic, supabaseServer } from "@/lib/supabase/server";

export async function setLang(lang: "en" | "sw") {
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export type FormState = { ok: boolean; error?: "required" | "generic"; summary?: string; reference?: string } | null;

const str = (fd: FormData, k: string, max = 2000) => {
  const v = String(fd.get(k) ?? "").trim();
  return v ? v.slice(0, max) : null;
};

function bookingReference() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
  return `DV-${ymd}-${rand}`;
}

async function notify(subject: string, body: string, to = process.env.NOTIFY_EMAIL) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "DOLF VISUALS Website <onboarding@resend.dev>", to: [to], subject, text: body }),
    });
  } catch (e) {
    console.error("[notify]", e);
  }
}

export async function submitBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  if (str(fd, "website")) return { ok: true }; // honeypot: silently drop bots
  const row = {
    name: str(fd, "name", 120),
    phone: str(fd, "phone", 40),
    email: str(fd, "email", 160),
    service_slug: str(fd, "service", 80),
    event_date: str(fd, "event_date", 20),
    location: str(fd, "location", 200),
    guests: str(fd, "guests", 40),
    budget: str(fd, "budget", 80),
    details: str(fd, "details", 3000),
    request_type: str(fd, "request_type", 10) === "quote" ? "quote" : "booking",
    reference: bookingReference(),
  };
  if (!row.name || !row.phone) return { ok: false, error: "required" };
  const isQuote = row.request_type === "quote";

  const summary = [
    `${isQuote ? "Quotation request" : "Booking request"} ${row.reference} — ${row.name}`,
    `Phone: ${row.phone}`,
    row.email && `Email: ${row.email}`,
    row.service_slug && `Service: ${row.service_slug}`,
    row.event_date && `Date: ${row.event_date}`,
    row.location && `Location: ${row.location}`,
    row.guests && `Guests: ${row.guests}`,
    row.budget && `Budget: ${row.budget}`,
    row.details && `Details: ${row.details}`,
  ].filter(Boolean).join("\n");

  if (hasSupabase) {
    // signed-in clients: attach the booking to their account so it shows in the client portal
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    const clientId = user ? (await sb.rpc("dv_my_client_id")).data as string | null : null;
    const { error } = await (user ? sb : supabasePublic()).from("dv_bookings").insert({ ...row, client_id: clientId ?? null });
    if (error) {
      console.error("[booking]", error);
      return { ok: false, error: "generic", summary };
    }
  }
  await notify(`New ${isQuote ? "quotation request" : "booking"} ${row.reference}: ${row.name}${row.event_date ? ` (${row.event_date})` : ""}`, summary);
  // confirmation to the client (only when email notifications are configured)
  if (row.email) {
    await notify(
      `DOLF VISUALS — we received your ${isQuote ? "quotation request" : "booking request"} (${row.reference})`,
      `Hello ${row.name},\n\nThank you for contacting DOLF VISUALS. We have received your ${isQuote ? "quotation request" : "booking request"}.\nReference: ${row.reference}\n\nOur team will contact you shortly to confirm availability and details.\n\n— DOLF VISUALS\nTurning Moments Into Art\n+255 756 506 908 · dolfvisuals@gmail.com`,
      row.email,
    );
  }
  return { ok: true, summary, reference: row.reference };
}

export async function submitInquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  if (str(fd, "website")) return { ok: true };
  const row = {
    name: str(fd, "name", 120),
    phone: str(fd, "phone", 40),
    email: str(fd, "email", 160),
    subject: str(fd, "subject", 200),
    message: str(fd, "message", 4000),
  };
  if (!row.name || !row.message || (!row.phone && !row.email)) return { ok: false, error: "required" };

  const summary = [`Message from ${row.name}`, row.phone && `Phone: ${row.phone}`, row.email && `Email: ${row.email}`,
    row.subject && `Subject: ${row.subject}`, row.message].filter(Boolean).join("\n");

  if (hasSupabase) {
    const { error } = await supabasePublic().from("dv_inquiries").insert(row);
    if (error) {
      console.error("[inquiry]", error);
      return { ok: false, error: "generic", summary };
    }
  }
  await notify(`New website message: ${row.name}`, summary);
  return { ok: true, summary };
}
