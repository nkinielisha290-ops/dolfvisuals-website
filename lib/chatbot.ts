/**
 * DOLF VISUALS assistant: a small, offline FAQ engine (English + Swahili).
 * It only answers from real site data (services, packages, contacts) and hands
 * anything it cannot answer to WhatsApp. Safe to import in client components.
 */
import type { Lang } from "./types";

export type ChatKB = {
  lang: Lang;
  services: { slug: string; title: string; summary: string }[];
  packages: { name: string; price: number | null; note: string | null }[];
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
};

export type ChatAction = { label: string; href: string; external?: boolean };
export type ChatReply = { text: string; actions?: ChatAction[]; chips?: string[] };

const T = {
  en: {
    welcome: "Hi! 👋 I'm the DOLF VISUALS assistant. I can tell you about our services, prices, bookings and how to reach us. What would you like to know?",
    chips: ["Services", "Prices", "Book a session", "Location", "Talk to a person"],
    services: "We offer:",
    services_more: "Tap one to learn more, or book straight away.",
    prices_some: "Here are our packages:",
    prices_none: "Our prices depend on the event, hours and deliverables, so every quote is tailored. Our packages are:",
    prices_cta: "Send a quick quotation request and we'll reply with an exact price.",
    on_request: "on request",
    booking: "Booking takes about a minute: choose the service, date and location, and you get a reference number right away. Our team then confirms availability with you.",
    location: "We're based in {location}, and we travel for events across Tanzania and beyond.",
    contact: "You can reach us any time:\n📞 {phone}\n💬 WhatsApp: {phone}\n✉️ {email}",
    human: "Sure! Our team will gladly help. Tap below to chat with us on WhatsApp.",
    portfolio: "Have a look at our recent work: weddings, portraits, corporate, events and more.",
    account: "With a free client account you can follow your bookings, see invoices and payments, and download your files when they're ready.",
    payment: "Payment details are shared with your invoice once your booking is confirmed. Our team will guide you through it.",
    delivery: "Delivery time depends on the project size. We'll confirm the exact timeline when you book, and you can track progress in your client account.",
    thanks: "You're welcome! Anything else I can help with?",
    fallback: "I'm not sure about that one yet, but our team can answer right away on WhatsApp.",
    service_cta: "Book this",
    btn_book: "Book a session", btn_quote: "Request a quote", btn_wa: "Chat on WhatsApp", btn_call: "Call us",
    btn_portfolio: "View portfolio", btn_pricing: "See pricing", btn_account: "Create account", btn_services: "All services",
    btn_map: "Contact & map", more: "Learn more",
    wa_text: "Hello DOLF VISUALS, I have a question:",
  },
  sw: {
    welcome: "Habari! 👋 Mimi ni msaidizi wa DOLF VISUALS. Naweza kukueleza kuhusu huduma, bei, booking na jinsi ya kutufikia. Ungependa kujua nini?",
    chips: ["Huduma", "Bei", "Weka booking", "Mahali tulipo", "Ongea na mtu"],
    services: "Tunatoa huduma hizi:",
    services_more: "Chagua moja kujua zaidi, au weka booking moja kwa moja.",
    prices_some: "Hizi ni packages zetu:",
    prices_none: "Bei zetu zinategemea aina ya tukio, muda na kazi utakayopokea, kwa hiyo kila bei inaandaliwa kwa ajili yako. Packages zetu ni:",
    prices_cta: "Tuma ombi la bei, tutakujibu na bei kamili.",
    on_request: "kwa ombi",
    booking: "Booking inachukua kama dakika moja: chagua huduma, tarehe na mahali, na unapata namba ya kumbukumbu papo hapo. Kisha timu yetu inathibitisha nawe.",
    location: "Tuko {location}, na tunasafiri kwa matukio sehemu zote Tanzania na nje.",
    contact: "Unaweza kutufikia muda wowote:\n📞 {phone}\n💬 WhatsApp: {phone}\n✉️ {email}",
    human: "Sawa kabisa! Timu yetu itakusaidia. Bonyeza hapa chini kuongea nasi WhatsApp.",
    portfolio: "Angalia kazi zetu za karibuni: harusi, picha binafsi, kampuni, matukio na zaidi.",
    account: "Ukiwa na akaunti ya mteja (bure) unaweza kufuatilia booking zako, kuona invoice na malipo, na kupakua kazi yako ikiwa tayari.",
    payment: "Maelezo ya malipo yanatumwa pamoja na invoice baada ya booking kuthibitishwa. Timu yetu itakuongoza.",
    delivery: "Muda wa kukabidhi kazi unategemea ukubwa wa mradi. Tutakuthibitishia ratiba ukiweka booking, na unaweza kufuatilia hatua kwenye akaunti yako.",
    thanks: "Karibu sana! Kuna kingine naweza kukusaidia?",
    fallback: "Hilo bado sina jibu lake, lakini timu yetu itakujibu papo hapo WhatsApp.",
    service_cta: "Weka booking",
    btn_book: "Weka booking", btn_quote: "Omba bei", btn_wa: "Ongea WhatsApp", btn_call: "Tupigie",
    btn_portfolio: "Ona kazi zetu", btn_pricing: "Ona bei", btn_account: "Fungua akaunti", btn_services: "Huduma zote",
    btn_map: "Mawasiliano na ramani", more: "Soma zaidi",
    wa_text: "Habari DOLF VISUALS, nina swali:",
  },
};

export function chatText(lang: Lang) {
  return T[lang] ?? T.en;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** keyword stems per intent (English + Swahili). Order matters: first match wins. */
const INTENTS: [string, string[]][] = [
  ["human", ["talk to", "person", "human", "agent", "someone", "ongea na mtu", "mtu halisi", "mhudumu", "nataka kuongea"]],
  ["thanks", ["thank", "thanks", "asante", "shukran", "poa sana", "nashukuru"]],
  ["prices", ["price", "prices", "pricing", "cost", "how much", "rate", "rates", "package", "budget", "quote", "quotation", "bei", "gharama", "shilingi", "tsh", "kiasi gani", "ngapi", "package"]],
  ["booking", ["book", "booking", "reserve", "appointment", "schedule", "hire", "available", "availability", "weka booking", "kuweka", "nafasi", "tarehe", "miadi", "kodi"]],
  ["account", ["account", "sign up", "signup", "register", "login", "log in", "sign in", "password", "akaunti", "jisajili", "kuingia", "nenosiri"]],
  ["payment", ["pay", "payment", "mpesa", "m pesa", "tigo", "airtel", "halopesa", "bank", "deposit", "invoice", "malipo", "kulipa", "lipa", "benki", "advance"]],
  ["delivery", ["deliver", "delivery", "how long", "when will", "ready", "turnaround", "days", "edit", "editing", "kukabidhi", "muda gani", "lini", "itachukua", "tayari", "siku ngapi"]],
  ["location", ["where", "location", "located", "address", "office", "map", "travel", "wapi", "mahali", "ofisi", "mko", "mnapatikana", "anuani", "ramani"]],
  ["contact", ["contact", "phone", "call", "number", "email", "whatsapp", "reach", "simu", "namba", "piga", "barua pepe", "mawasiliano", "wasiliana"]],
  ["portfolio", ["portfolio", "work", "sample", "samples", "gallery", "photos", "videos", "example", "kazi zenu", "kazi zetu", "mifano", "picha zenu", "video zenu"]],
  ["services", ["service", "services", "offer", "do you do", "what do you", "huduma", "mnafanya", "mnatoa", "mnapiga"]],
  ["greeting", ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "habari", "mambo", "salama", "hujambo", "shikamoo", "niaje", "sasa", "vipi", "jambo"]],
];

function hasWord(text: string, kw: string) {
  return ` ${text} `.includes(` ${kw} `) || (kw.length > 4 && text.includes(kw));
}

export function detectIntent(input: string): string {
  const t = norm(input);
  if (!t) return "fallback";
  for (const [intent, kws] of INTENTS) if (kws.some((k) => hasWord(t, norm(k)))) return intent;
  return "fallback";
}

/** Match a specific service by its title words or slug (e.g. "wedding", "harusi", "drone"). */
function findService(input: string, kb: ChatKB) {
  const t = norm(input);
  const extra: Record<string, string[]> = {
    wedding: ["harusi", "ndoa", "send off", "sendoff", "kitchen party", "bride"],
    graduation: ["mahafali", "graduation", "kuhitimu"],
    corporate: ["kampuni", "company", "business", "brand", "biashara", "ofisi"],
    event: ["tukio", "matukio", "sherehe", "party", "birthday", "conference", "kongamano"],
    portrait: ["picha binafsi", "portrait", "headshot", "studio"],
    drone: ["drone", "aerial", "angani"],
    music: ["music video", "video ya muziki", "wimbo", "msanii"],
    documentary: ["documentary", "makala"],
    commercial: ["advert", "tangazo", "matangazo", "commercial", "ad"],
  };
  return kb.services.find((s) => {
    const words = norm(`${s.title} ${s.slug.replace(/-/g, " ")}`).split(" ").filter((w) => w.length > 3 && !["and", "services", "huduma", "production", "photography", "videography"].includes(w));
    if (words.some((w) => hasWord(t, w))) return true;
    return Object.entries(extra).some(([k, alts]) => s.slug.includes(k) && alts.some((a) => hasWord(t, norm(a))));
  });
}

const fill = (s: string, kb: ChatKB) => s.replace(/\{location\}/g, kb.location).replace(/\{phone\}/g, kb.phone).replace(/\{email\}/g, kb.email);
const tzs = (n: number) => `TSh ${Math.round(n).toLocaleString("en-US")}`;

export function waHref(kb: ChatKB, question?: string) {
  const c = chatText(kb.lang);
  const text = question ? `${c.wa_text} ${question}` : c.wa_text;
  return `https://wa.me/${kb.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}

export function welcome(kb: ChatKB): ChatReply {
  const c = chatText(kb.lang);
  return { text: c.welcome, chips: c.chips };
}

export function answer(input: string, kb: ChatKB): ChatReply {
  const c = chatText(kb.lang);
  const wa: ChatAction = { label: c.btn_wa, href: waHref(kb, input), external: true };
  const book: ChatAction = { label: c.btn_book, href: "/booking" };

  // quick-reply chips map straight onto intents
  const chipIntent = ["services", "prices", "booking", "location", "human"][c.chips.findIndex((x) => norm(x) === norm(input))];
  const svc = chipIntent ? undefined : findService(input, kb);
  const intent = chipIntent ?? detectIntent(input);

  if (svc && (intent === "fallback" || intent === "services" || intent === "booking" || intent === "prices")) {
    const isPrice = intent === "prices";
    return {
      text: `**${svc.title}**: ${svc.summary}${isPrice ? `\n\n${c.prices_cta}` : ""}`,
      actions: [
        { label: c.service_cta, href: `/booking?service=${svc.slug}${isPrice ? "&type=quote" : ""}` },
        { label: c.more, href: `/services/${svc.slug}` },
      ],
    };
  }

  switch (intent) {
    case "greeting":
      return welcome(kb);
    case "services":
      return {
        text: `${c.services}\n${kb.services.map((s) => `• ${s.title}`).join("\n")}\n\n${c.services_more}`,
        chips: kb.services.slice(0, 6).map((s) => s.title),
        actions: [{ label: c.btn_services, href: "/services" }, book],
      };
    case "prices": {
      const priced = kb.packages.some((p) => p.price != null);
      const list = kb.packages.map((p) => `• ${p.name}: ${p.price != null ? tzs(p.price) : c.on_request}${p.note ? ` (${p.note})` : ""}`).join("\n");
      return {
        text: `${priced ? c.prices_some : c.prices_none}\n${list}\n\n${c.prices_cta}`,
        actions: [{ label: c.btn_quote, href: "/booking?type=quote" }, { label: c.btn_pricing, href: "/pricing" }],
      };
    }
    case "booking":
      return { text: c.booking, actions: [book, wa] };
    case "location":
      return { text: fill(c.location, kb), actions: [{ label: c.btn_map, href: "/contact" }, wa] };
    case "contact":
      return { text: fill(c.contact, kb), actions: [wa, { label: c.btn_call, href: `tel:${kb.phone.replace(/\s/g, "")}`, external: true }] };
    case "portfolio":
      return { text: c.portfolio, actions: [{ label: c.btn_portfolio, href: "/portfolio" }, book] };
    case "account":
      return { text: c.account, actions: [{ label: c.btn_account, href: "/account/register" }] };
    case "payment":
      return { text: c.payment, actions: [wa] };
    case "delivery":
      return { text: c.delivery, actions: [book, wa] };
    case "thanks":
      return { text: c.thanks, chips: c.chips };
    case "human":
      return { text: c.human, actions: [wa, { label: c.btn_call, href: `tel:${kb.phone.replace(/\s/g, "")}`, external: true }] };
    default:
      return { text: c.fallback, actions: [wa], chips: c.chips };
  }
}
