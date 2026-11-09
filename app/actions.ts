"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { supabasePublic } from "@/lib/supabase/server";

export async function setLang(lang: "en" | "sw") {
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export type FormState = { ok: boolean; error?: "required" | "generic"; summary?: string } | null;

const str = (fd: FormData, k: string, max = 2000) => {
  const v = String(fd.get(k) ?? "").trim();
  return v ? v.slice(0, max) : null;
};

async function notify(subject: string, body: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
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
  };
  if (!row.name || !row.phone) return { ok: false, error: "required" };

  const summary = [
    `Booking request — ${row.name}`,
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
    const { error } = await supabasePublic().from("bookings").insert(row);
    if (error) {
      console.error("[booking]", error);
      return { ok: false, error: "generic", summary };
    }
  }
  await notify(`New booking: ${row.name}${row.event_date ? ` (${row.event_date})` : ""}`, summary);
  return { ok: true, summary };
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
    const { error } = await supabasePublic().from("inquiries").insert(row);
    if (error) {
      console.error("[inquiry]", error);
      return { ok: false, error: "generic", summary };
    }
  }
  await notify(`New website message: ${row.name}`, summary);
  return { ok: true, summary };
}
