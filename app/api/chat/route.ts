import { NextResponse, type NextRequest } from "next/server";
import { getPackages, getServices, getSettings } from "@/lib/data";
import { tr } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Optional AI answers for the website chat. Only active when ANTHROPIC_API_KEY is set;
 * otherwise the widget uses its built-in FAQ engine. The model only knows the facts below
 * and is told to send anything else to WhatsApp.
 */
export const runtime = "nodejs";

const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1;
  return h.n > 12; // 12 messages per minute per visitor
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "disabled" }, { status: 501 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (limited(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });

  let body: { lang?: Lang; messages?: { role: string; content: string }[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad" }, { status: 400 }); }
  const lang: Lang = body.lang === "sw" ? "sw" : "en";
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 800) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "bad" }, { status: 400 });
  while (messages.length && messages[0].role !== "user") messages.shift();

  const [s, services, packages] = await Promise.all([getSettings(), getServices(), getPackages()]);
  const facts = [
    `Business: DOLF VISUALS, photography, videography and creative agency. Tagline: "${tr(s, "tagline", "en")}".`,
    `Location: ${s.location_en}. Travels for events.`,
    `Phone and WhatsApp: ${s.phone}. Email: ${s.email}.`,
    `Services:\n${services.map((x) => `- ${tr(x, "title", lang)} (/services/${x.slug}): ${tr(x, "summary", lang)}`).join("\n")}`,
    `Packages:\n${packages.map((p) => `- ${tr(p, "name", lang)}: ${p.price != null ? `TSh ${Number(p.price).toLocaleString("en-US")}` : "price on request"}${tr(p, "price_note", lang) ? ` (${tr(p, "price_note", lang)})` : ""}`).join("\n")}`,
    `Website pages: /booking (booking form, add ?type=quote for a quotation), /pricing, /portfolio, /contact, /account/register (free client account to track bookings, invoices and downloads).`,
  ].join("\n\n");

  const system = `You are the friendly website assistant for DOLF VISUALS in Tanzania. Reply in ${lang === "sw" ? "Swahili" : "English"} unless the visitor writes in the other language, then match them.
Keep replies short (at most 4 sentences or a short list), warm and professional. Use only the facts below. Never invent prices, availability, delivery times, discounts, payment details, team members or past clients. If you do not know, say the team will confirm and suggest WhatsApp ${s.phone}. Encourage booking via /booking when relevant. Do not discuss topics unrelated to DOLF VISUALS.

FACTS
${facts}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.CHAT_MODEL || "claude-haiku-5-5", max_tokens: 400, system, messages }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) { console.error("[chat]", r.status, await r.text()); return NextResponse.json({ error: "upstream" }, { status: 502 }); }
    const data = await r.json() as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    if (!text) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json({ text });
  } catch (e) {
    console.error("[chat]", e);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
