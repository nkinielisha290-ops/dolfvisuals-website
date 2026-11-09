export type Lang = "en" | "sw";

export type Settings = {
  id: number;
  tagline_en: string;
  tagline_sw: string;
  hero_title_en: string;
  hero_title_sw: string;
  hero_subtitle_en: string;
  hero_subtitle_sw: string;
  phone: string;
  whatsapp: string;
  email: string;
  location_en: string;
  location_sw: string;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  linkedin: string | null;
  founded: string;
};

export type Service = {
  id: string;
  slug: string;
  title_en: string;
  title_sw: string;
  summary_en: string;
  summary_sw: string;
  description_en: string;
  description_sw: string;
  cover_url: string | null;
  portfolio_category: string | null;
  sort: number;
  published: boolean;
};

export type Package = {
  id: string;
  service_slug: string | null;
  name_en: string;
  name_sw: string;
  price: number | null;
  price_note_en: string | null;
  price_note_sw: string | null;
  features_en: string[];
  features_sw: string[];
  featured: boolean;
  sort: number;
  published: boolean;
};

export type PortfolioItem = {
  id: string;
  title_en: string;
  title_sw: string;
  description_en: string | null;
  description_sw: string | null;
  category: string;
  media_type: "image" | "video";
  image_url: string;
  video_url: string | null;
  width: number | null;
  height: number | null;
  featured: boolean;
  project_slug: string | null;
  sort: number;
  published: boolean;
};

export type Project = {
  id: string;
  slug: string;
  title_en: string;
  title_sw: string;
  client: string | null;
  summary_en: string;
  summary_sw: string;
  cover_url: string | null;
  project_date: string | null;
  sort: number;
  published: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  role_en: string;
  role_sw: string;
  bio_en: string | null;
  bio_sw: string | null;
  photo_url: string | null;
  sort: number;
  published: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  organization: string | null;
  quote_en: string;
  quote_sw: string | null;
  photo_url: string | null;
  video_url: string | null;
  rating: number | null;
  approved: boolean;
  sort: number;
};

export type Booking = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  service_slug: string | null;
  event_date: string | null;
  location: string | null;
  guests: string | null;
  budget: string | null;
  details: string | null;
  status: "new" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled";
  admin_notes: string | null;
};

export type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied";
};
