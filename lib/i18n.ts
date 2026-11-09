import type { Lang } from "./types";

/** Pick a bilingual field: tr(obj, "title", lang) -> obj.title_sw ?? obj.title_en */
export function tr<T extends Record<string, unknown>>(obj: T, key: string, lang: Lang): string {
  const v = obj[`${key}_${lang}`] as string | null | undefined;
  if (v && String(v).trim()) return String(v);
  return (obj[`${key}_en`] as string) ?? "";
}

export function trList<T extends Record<string, unknown>>(obj: T, key: string, lang: Lang): string[] {
  const v = obj[`${key}_${lang}`] as string[] | null | undefined;
  if (v && v.length) return v;
  return (obj[`${key}_en`] as string[]) ?? [];
}

/** Portfolio categories from the brief (section 4) */
export const CATEGORIES: { slug: string; en: string; sw: string }[] = [
  { slug: "wedding-photography", en: "Wedding Photography", sw: "Picha za Harusi" },
  { slug: "wedding-videography", en: "Wedding Videography", sw: "Video za Harusi" },
  { slug: "graduation", en: "Graduation", sw: "Mahafali" },
  { slug: "birthday-photography", en: "Birthday Photography", sw: "Picha za Birthday" },
  { slug: "birthday-videography", en: "Birthday Videography", sw: "Video za Birthday" },
  { slug: "events", en: "Events Coverage", sw: "Matukio" },
  { slug: "corporate-photography", en: "Corporate Photography", sw: "Picha za Kikampuni" },
  { slug: "corporate-videography", en: "Corporate Videography", sw: "Video za Kikampuni" },
  { slug: "product", en: "Product Photography", sw: "Picha za Bidhaa" },
  { slug: "commercial", en: "Commercial Photography", sw: "Picha za Kibiashara" },
  { slug: "promotional-videos", en: "Promotional Videos", sw: "Video za Matangazo" },
  { slug: "behind-the-scenes", en: "Behind the Scenes", sw: "Nyuma ya Pazia" },
];

export function categoryLabel(slug: string, lang: Lang) {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return c ? c[lang] : slug;
}

const dict = {
  en: {
    nav_home: "Home", nav_about: "About", nav_services: "Services", nav_portfolio: "Portfolio",
    nav_projects: "Projects", nav_pricing: "Pricing", nav_testimonials: "Testimonials",
    nav_contact: "Contact", nav_book: "Book a Session",
    hero_cta_work: "View Our Work", hero_cta_book: "Book a Session",
    scroll: "Scroll",
    services_eyebrow: "What we do", services_title: "Services crafted for every story",
    services_all: "All services", learn_more: "Learn more",
    portfolio_eyebrow: "Selected work", portfolio_title: "Moments we've turned into art",
    portfolio_all: "Full portfolio", all: "All",
    about_eyebrow: "Our story", about_title: "Built on resilience. Driven by craft.",
    about_more: "Read our story",
    values_eyebrow: "What we stand for",
    process_eyebrow: "How it works", process_title: "From first message to final delivery",
    process: [
      ["Tell us your story", "Share your event, date and vision through the booking form or WhatsApp."],
      ["Get a tailored quote", "We recommend a package that fits your moment and your budget."],
      ["We capture it", "Our team arrives prepared — composed, lit and directed with care."],
      ["Delivered with care", "Professionally edited photos and films, delivered in full quality."],
    ],
    testi_eyebrow: "Kind words", testi_title: "What our clients say",
    testi_empty: "Client reviews will appear here soon.",
    cta_title: "Have a moment worth remembering?", cta_text: "Let's plan your shoot. Tell us the date and we'll take it from there.",
    whatsapp_us: "Chat on WhatsApp",
    mission: "Mission", vision: "Vision",
    team_eyebrow: "The people", team_title: "Meet the team", team_empty: "Team profiles are coming soon.",
    pricing_eyebrow: "Packages", pricing_title: "Packages & pricing",
    pricing_text: "Every event is different. Pick a starting point, or request a custom quotation.",
    on_request: "On request", request_quote: "Request a quote", from: "From", most_popular: "Most popular",
    projects_eyebrow: "Case studies", projects_title: "Selected projects", projects_empty: "Featured case studies are coming soon.",
    contact_eyebrow: "Get in touch", contact_title: "Let's create something remarkable",
    contact_text: "Questions, ideas or partnership enquiries — we reply fast.",
    phone: "Phone", email: "Email", location: "Location", follow: "Follow us",
    f_name: "Full name", f_phone: "Phone / WhatsApp", f_email: "Email (optional)", f_subject: "Subject",
    f_message: "Message", f_send: "Send message",
    book_eyebrow: "Booking", book_title: "Book your session",
    book_text: "Tell us about your event. We'll confirm availability and send a quotation, usually within a few hours.",
    f_service: "Service", f_choose: "Choose a service", f_date: "Preferred date", f_location: "Event location",
    f_guests: "Expected guests (optional)", f_budget: "Budget range (optional)", f_details: "Tell us more about your event",
    f_submit: "Send booking request",
    f_submit_quote: "Request quotation",
    req_booking: "Book a session", req_quote: "Request a quote",
    ref_label: "Your reference number", ref_hint: "Keep this number — quote it when you contact us.",
    share: "Share", copy_link: "Copy link", copied: "Link copied",
    films_eyebrow: "Films", films_title: "Video showcase", showreel: "Showreel",
    films_note: "Cinematic films and highlight videos.",
    responsibilities: "Responsibilities",
    hl_clients: "Trusted by", hl_partners: "Partners & collaborations", hl_awards: "Awards & certificates", hl_press: "In the press",
    sent_title: "Thank you! Your request has been received.",
    sent_text: "We'll contact you shortly. For a faster reply, send it to us on WhatsApp too.",
    sent_wa: "Send on WhatsApp", sent_again: "Send another",
    err_required: "Please fill in your name and phone number.",
    err_generic: "Something went wrong. Please try WhatsApp instead.",
    footer_text: "Professional photography, cinematic videography and creative visual production — Dar es Salaam, Tanzania.",
    footer_explore: "Explore", footer_rights: "All rights reserved.",
    gallery_close: "Close", watch: "Watch",
    service_book: "Book this service", service_packages: "Packages", service_gallery: "From the portfolio",
    founded: "Founded",
  },
  sw: {
    nav_home: "Mwanzo", nav_about: "Kuhusu", nav_services: "Huduma", nav_portfolio: "Kazi Zetu",
    nav_projects: "Miradi", nav_pricing: "Bei", nav_testimonials: "Shuhuda",
    nav_contact: "Mawasiliano", nav_book: "Weka Booking",
    hero_cta_work: "Tazama Kazi Zetu", hero_cta_book: "Weka Booking",
    scroll: "Shuka",
    services_eyebrow: "Tunachofanya", services_title: "Huduma kwa kila simulizi",
    services_all: "Huduma zote", learn_more: "Soma zaidi",
    portfolio_eyebrow: "Kazi teule", portfolio_title: "Matukio tuliyoyageuza kuwa sanaa",
    portfolio_all: "Kazi zote", all: "Zote",
    about_eyebrow: "Historia yetu", about_title: "Tumejengwa kwa ustahimilivu. Tunaongozwa na ubora.",
    about_more: "Soma historia yetu",
    values_eyebrow: "Misingi yetu",
    process_eyebrow: "Jinsi tunavyofanya kazi", process_title: "Kuanzia ujumbe wa kwanza hadi kazi kukabidhiwa",
    process: [
      ["Tueleze simulizi yako", "Tutumie tukio lako, tarehe na wazo lako kupitia fomu ya booking au WhatsApp."],
      ["Pata bei maalum", "Tunakushauri package inayoendana na tukio lako na bajeti yako."],
      ["Tunanasa tukio", "Timu yetu inafika ikiwa imejiandaa — mwanga, mpangilio na uongozaji makini."],
      ["Tunakabidhi kwa ubora", "Picha na video zilizohaririwa kitaalamu, kwa ubora kamili."],
    ],
    testi_eyebrow: "Maneno ya wateja", testi_title: "Wateja wetu wanasemaje",
    testi_empty: "Shuhuda za wateja zitaonekana hapa hivi karibuni.",
    cta_title: "Una tukio linalostahili kukumbukwa?", cta_text: "Tupange shooting yako. Tuambie tarehe, sisi tutafanya mengine.",
    whatsapp_us: "Ongea nasi WhatsApp",
    mission: "Dhamira", vision: "Maono",
    team_eyebrow: "Watu wetu", team_title: "Kutana na timu", team_empty: "Taarifa za timu zinakuja hivi karibuni.",
    pricing_eyebrow: "Packages", pricing_title: "Packages na bei",
    pricing_text: "Kila tukio ni tofauti. Chagua pa kuanzia, au omba bei maalum.",
    on_request: "Kwa maombi", request_quote: "Omba bei", from: "Kuanzia", most_popular: "Inayopendwa zaidi",
    projects_eyebrow: "Miradi", projects_title: "Miradi teule", projects_empty: "Miradi maalum itaonekana hapa hivi karibuni.",
    contact_eyebrow: "Wasiliana nasi", contact_title: "Tutengeneze kitu cha kipekee",
    contact_text: "Maswali, mawazo au ushirikiano — tunajibu haraka.",
    phone: "Simu", email: "Barua pepe", location: "Mahali", follow: "Tufuatilie",
    f_name: "Jina kamili", f_phone: "Simu / WhatsApp", f_email: "Barua pepe (si lazima)", f_subject: "Kichwa",
    f_message: "Ujumbe", f_send: "Tuma ujumbe",
    book_eyebrow: "Booking", book_title: "Weka booking yako",
    book_text: "Tueleze kuhusu tukio lako. Tutathibitisha upatikanaji na kukutumia bei, mara nyingi ndani ya saa chache.",
    f_service: "Huduma", f_choose: "Chagua huduma", f_date: "Tarehe unayopendelea", f_location: "Mahali pa tukio",
    f_guests: "Idadi ya wageni (si lazima)", f_budget: "Bajeti (si lazima)", f_details: "Tueleze zaidi kuhusu tukio lako",
    f_submit: "Tuma ombi la booking",
    f_submit_quote: "Omba bei",
    req_booking: "Weka booking", req_quote: "Omba bei (quotation)",
    ref_label: "Namba yako ya kumbukumbu", ref_hint: "Hifadhi namba hii — itaje unapowasiliana nasi.",
    share: "Shiriki", copy_link: "Nakili link", copied: "Link imenakiliwa",
    films_eyebrow: "Filamu", films_title: "Video zetu", showreel: "Showreel",
    films_note: "Filamu za kisinema na video fupi za matukio.",
    responsibilities: "Majukumu",
    hl_clients: "Wateja wetu", hl_partners: "Washirika", hl_awards: "Tuzo na vyeti", hl_press: "Kwenye vyombo vya habari",
    sent_title: "Asante! Ombi lako limepokelewa.",
    sent_text: "Tutawasiliana nawe hivi punde. Kwa majibu ya haraka zaidi, litume pia WhatsApp.",
    sent_wa: "Tuma WhatsApp", sent_again: "Tuma lingine",
    err_required: "Tafadhali jaza jina na namba ya simu.",
    err_generic: "Kuna tatizo limetokea. Tafadhali tumia WhatsApp.",
    footer_text: "Upigaji picha wa kitaalamu, video za kisinema na ubunifu wa kuona — Dar es Salaam, Tanzania.",
    footer_explore: "Kurasa", footer_rights: "Haki zote zimehifadhiwa.",
    gallery_close: "Funga", watch: "Tazama",
    service_book: "Weka booking ya huduma hii", service_packages: "Packages", service_gallery: "Kutoka kwenye kazi zetu",
    founded: "Ilianzishwa",
  },
} as const;

export type Dict = (typeof dict)["en"];
export function getDict(lang: Lang): Dict {
  return dict[lang] as unknown as Dict;
}
