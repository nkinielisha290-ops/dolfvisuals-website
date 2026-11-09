/**
 * Built-in content used when Supabase is not configured (and as the initial
 * content inserted by supabase/schema.sql). Text comes from the client brief.
 */
import type { Package, PortfolioItem, Project, Service, Settings, TeamMember, Testimonial } from "./types";

export const seedSettings: Settings = {
  id: 1,
  tagline_en: "Turning Moments Into Art",
  tagline_sw: "Tunageuza Matukio Kuwa Sanaa",
  hero_title_en: "Turning moments into art",
  hero_title_sw: "Tunageuza matukio kuwa sanaa",
  hero_subtitle_en:
    "Professional photography, cinematic videography and creative visual production for weddings, graduations, events and brands.",
  hero_subtitle_sw:
    "Upigaji picha wa kitaalamu, video za kisinema na ubunifu wa kuona kwa harusi, mahafali, matukio na makampuni.",
  phone: "+255 756 506 908",
  whatsapp: "255756506908",
  email: "dolfvisuals@gmail.com",
  location_en: "Dar es Salaam, Tanzania",
  location_sw: "Dar es Salaam, Tanzania",
  instagram: null,
  facebook: null,
  tiktok: null,
  youtube: null,
  linkedin: null,
  founded: "2025-10-11",
  hero_video_url: null,
  hero_video_mobile_url: null,
};

const s = (
  sort: number, slug: string, cat: string | null, cover: string | null,
  title_en: string, title_sw: string, summary_en: string, summary_sw: string,
  description_en: string, description_sw: string,
): Service => ({
  id: `seed-svc-${slug}`, slug, portfolio_category: cat, cover_url: cover, sort, published: true,
  title_en, title_sw, summary_en, summary_sw, description_en, description_sw,
});

export const seedServices: Service[] = [
  s(1, "wedding", "wedding-photography", "/portfolio/bridal-staircase.webp",
    "Wedding Photography & Videography", "Picha na Video za Harusi",
    "Ceremonies, receptions, couple portraits and every moment in between.",
    "Sherehe, mapokezi, picha za maharusi na kila tukio katikati yake.",
    "Capturing wedding ceremonies, receptions, couples' portraits and memorable wedding moments — documented with a cinematic eye and delivered as a story you'll relive for a lifetime.",
    "Tunanasa sherehe za harusi, mapokezi, picha za maharusi na matukio yote ya kukumbukwa — kwa jicho la kisinema, na kukukabidhi simulizi utakayoikumbuka maisha yote."),
  s(2, "photography", "commercial", "/portfolio/studio-portrait-chair-1.webp",
    "Photography", "Upigaji Picha",
    "Professional photography for individuals, brands and organizations.",
    "Picha za kitaalamu kwa watu binafsi, makampuni na taasisi.",
    "Professional photography services for individuals, brands and organizations — studio and on-location, with controlled lighting, creative framing and consistent editing.",
    "Huduma za upigaji picha za kitaalamu kwa watu binafsi, makampuni na taasisi — studio au eneo la tukio, kwa mwanga uliodhibitiwa, mpangilio wa kibunifu na uhariri thabiti."),
  s(3, "videography", "promotional-videos", "/portfolio/tia-marathon-duo.webp",
    "Videography", "Upigaji Video",
    "Event films and cinematic visual storytelling.",
    "Filamu za matukio na usimulizi wa kisinema.",
    "High-quality video production, event films and cinematic visual storytelling — smooth camera movement, professional audio and consistent colour grading.",
    "Utengenezaji wa video za ubora wa juu, filamu za matukio na usimulizi wa kisinema — kamera tulivu, sauti ya kitaalamu na rangi zinazolingana."),
  s(4, "graduation", "graduation", "/portfolio/lifestyle-sunset-joy.webp",
    "Graduation Photography", "Picha za Mahafali",
    "Portraits, group shots and graduation celebrations.",
    "Picha binafsi, za makundi na sherehe za mahafali.",
    "Professional graduation portraits, individual sessions, group photography and graduation celebrations.",
    "Picha za mahafali za kitaalamu, sessions binafsi, picha za makundi na sherehe za mahafali."),
  s(5, "birthday-events", "events", "/portfolio/tia-marathon-friends.webp",
    "Birthday & Event Coverage", "Birthday na Matukio",
    "Birthdays, private celebrations, parties and special occasions.",
    "Birthday, sherehe binafsi, pati na matukio maalum.",
    "Photography and videography for birthdays, private celebrations, parties and special occasions.",
    "Picha na video kwa birthday, sherehe binafsi, pati na matukio maalum."),
  s(6, "corporate", "corporate-photography", "/portfolio/corporate-portrait-suit.webp",
    "Corporate Photography & Videography", "Picha na Video za Kikampuni",
    "Headshots, conferences, corporate events and business branding.",
    "Picha za wafanyakazi, mikutano, matukio ya kikampuni na branding.",
    "Professional visual content for companies, organizations, conferences, corporate events and business branding — including executive headshots and team portraits.",
    "Maudhui ya kitaalamu kwa makampuni, taasisi, mikutano, matukio ya kikampuni na branding ya biashara — pamoja na picha za viongozi na timu."),
  s(7, "product", "product", null,
    "Product Photography", "Picha za Bidhaa",
    "Clean, high-quality product images for e-commerce and ads.",
    "Picha safi za bidhaa kwa maduka ya mtandaoni na matangazo.",
    "High-quality product images for businesses, e-commerce platforms, advertising and marketing campaigns.",
    "Picha za bidhaa za ubora wa juu kwa biashara, maduka ya mtandaoni, matangazo na kampeni za masoko."),
  s(8, "commercial", "commercial", "/portfolio/studio-portrait-golden.webp",
    "Commercial & Promotional Content", "Maudhui ya Matangazo",
    "Promotional videos, ad content and brand campaigns.",
    "Video za matangazo, maudhui ya matangazo na kampeni za brand.",
    "Creative promotional videos, advertising content, brand campaigns and business storytelling.",
    "Video za matangazo za kibunifu, maudhui ya matangazo, kampeni za brand na usimulizi wa biashara."),
  s(9, "creative-content", "behind-the-scenes", "/portfolio/studio-portrait-chair-2.webp",
    "Creative Content Production", "Utengenezaji wa Maudhui",
    "Visual content for social media and digital marketing.",
    "Maudhui ya kuona kwa mitandao ya kijamii na masoko ya kidijitali.",
    "Creative visual solutions for social media, digital marketing and brand communication.",
    "Suluhisho za kibunifu za kuona kwa mitandao ya kijamii, masoko ya kidijitali na mawasiliano ya brand."),
];

/** Package structure only — the brief says official rates will be supplied separately. */
export const seedPackages: Package[] = [
  {
    id: "seed-pkg-1", service_slug: null, sort: 1, published: true, featured: false, price: null,
    name_en: "Essential", name_sw: "Essential",
    price_note_en: "Short sessions & portraits", price_note_sw: "Sessions fupi na picha binafsi",
    features_en: ["Professional photographer", "Edited high-resolution photos", "Online gallery delivery"],
    features_sw: ["Mpiga picha wa kitaalamu", "Picha zilizohaririwa kwa ubora wa juu", "Kukabidhiwa kupitia gallery ya mtandaoni"],
  },
  {
    id: "seed-pkg-2", service_slug: null, sort: 2, published: true, featured: true, price: null,
    name_en: "Signature", name_sw: "Signature",
    price_note_en: "Events, graduations & celebrations", price_note_sw: "Matukio, mahafali na sherehe",
    features_en: ["Photography + videography", "Edited photos & highlight film", "Full event coverage", "Online gallery delivery"],
    features_sw: ["Picha + video", "Picha zilizohaririwa na highlight video", "Kunasa tukio zima", "Kukabidhiwa kupitia gallery ya mtandaoni"],
  },
  {
    id: "seed-pkg-3", service_slug: null, sort: 3, published: true, featured: false, price: null,
    name_en: "Premium", name_sw: "Premium",
    price_note_en: "Weddings & corporate productions", price_note_sw: "Harusi na uzalishaji wa kikampuni",
    features_en: ["Full creative team", "Cinematic film + photography", "Pre-event planning session", "Priority editing & delivery"],
    features_sw: ["Timu kamili ya ubunifu", "Filamu ya kisinema + picha", "Kikao cha maandalizi kabla ya tukio", "Uhariri na ukabidhi wa haraka"],
  },
];

const p = (sort: number, file: string, category: string, title_en: string, title_sw: string, featured = false, w = 1440, h = 1800): PortfolioItem => ({
  id: `seed-pf-${file}`, sort, category, title_en, title_sw, featured, published: true,
  description_en: null, description_sw: null, media_type: "image",
  image_url: `/portfolio/${file}.webp`, video_url: null, width: w, height: h, project_slug: null,
});

export const seedPortfolio: PortfolioItem[] = [
  p(1, "bridal-staircase", "wedding-photography", "Bridal portrait", "Picha ya bibi harusi", true),
  p(2, "studio-portrait-chair-1", "commercial", "Studio editorial", "Picha za studio", true, 1200, 1800),
  p(3, "tia-marathon-friends", "events", "Night event portraits", "Picha za usiku za tukio", true),
  p(4, "studio-portrait-golden", "commercial", "Colour studio session", "Session ya studio ya rangi", true, 1200, 1800),
  p(5, "corporate-portrait-thinking", "corporate-photography", "Executive portrait", "Picha ya kiongozi", true),
  p(6, "lifestyle-sunset-joy", "graduation", "Golden hour celebration", "Furaha ya jioni", true, 1200, 1800),
  p(7, "tia-marathon-duo", "events", "Event night portraits", "Picha za usiku", false),
  p(8, "corporate-portrait-arms-crossed", "corporate-photography", "Corporate headshot", "Picha ya kikampuni", true),
  p(9, "studio-portrait-chair-2", "commercial", "Studio editorial II", "Picha za studio II", false, 1200, 1800),
  p(10, "corporate-portrait-suit", "corporate-photography", "Professional profile", "Picha ya kitaalamu", true),
  p(11, "corporate-portrait-side-pose", "corporate-photography", "Corporate portrait", "Picha ya kikampuni", false),
  p(12, "corporate-portrait-standing", "corporate-photography", "Business profile", "Picha ya biashara", false),
  p(13, "corporate-portrait-white-shirt", "corporate-photography", "Clean headshot", "Picha safi ya uso", false),
];

export const seedProjects: Project[] = [];
export const seedTeam: TeamMember[] = [];
export const seedTestimonials: Testimonial[] = [];
