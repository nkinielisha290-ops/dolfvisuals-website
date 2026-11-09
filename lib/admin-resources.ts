import { CATEGORIES } from "./i18n";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "image" | "list" | "date" | "url" | "slug";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  /** dynamic options loaded from another table */
  optionsFrom?: { table: string; value: string; label: string };
  half?: boolean;
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  orderBy: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  fields: Field[];
};

const catOptions = CATEGORIES.map((c) => ({ value: c.slug, label: c.en }));

const bi = (name: string, label: string, type: FieldType = "text", required = false): Field[] => [
  { name: `${name}_en`, label: `${label} (English)`, type, required, half: type !== "textarea" && type !== "list" },
  { name: `${name}_sw`, label: `${label} (Kiswahili)`, type, half: type !== "textarea" && type !== "list" },
];

export const RESOURCES: Record<string, Resource> = {
  portfolio: {
    key: "portfolio", table: "dv_portfolio_items", label: "Portfolio", singular: "portfolio item",
    orderBy: "sort", titleField: "title_en", subtitleField: "category", imageField: "image_url",
    fields: [
      { name: "image_url", label: "Photo / video cover", type: "image", required: true },
      { name: "category", label: "Category", type: "select", options: catOptions, required: true, half: true },
      { name: "media_type", label: "Type", type: "select", options: [{ value: "image", label: "Photo" }, { value: "video", label: "Video" }], half: true },
      { name: "video_url", label: "Video link (YouTube / Vimeo)", type: "url", help: "Only for videos. The photo above is used as the cover." },
      ...bi("title", "Title"),
      ...bi("description", "Description", "textarea"),
      { name: "project_slug", label: "Part of project", type: "select", optionsFrom: { table: "dv_projects", value: "slug", label: "title_en" }, half: true },
      { name: "sort", label: "Order (lower shows first)", type: "number", half: true },
      { name: "featured", label: "Featured on home page", type: "checkbox", half: true },
      { name: "published", label: "Visible on website", type: "checkbox", half: true },
    ],
  },
  services: {
    key: "services", table: "dv_services", label: "Services", singular: "service",
    orderBy: "sort", titleField: "title_en", subtitleField: "summary_en", imageField: "cover_url",
    fields: [
      ...bi("title", "Title", "text", true),
      { name: "slug", label: "URL name", type: "slug", required: true, help: "e.g. wedding → /services/wedding", half: true },
      { name: "portfolio_category", label: "Show portfolio from category", type: "select", options: catOptions, half: true },
      ...bi("summary", "Short summary", "textarea"),
      ...bi("description", "Full description", "textarea"),
      { name: "cover_url", label: "Cover photo", type: "image" },
      { name: "sort", label: "Order", type: "number", half: true },
      { name: "published", label: "Visible on website", type: "checkbox", half: true },
    ],
  },
  packages: {
    key: "packages", table: "dv_packages", label: "Packages & Prices", singular: "package",
    orderBy: "sort", titleField: "name_en", subtitleField: "price",
    fields: [
      ...bi("name", "Package name", "text", true),
      { name: "price", label: "Price from (TSh)", type: "number", help: "Leave empty to show “On request”.", half: true },
      { name: "service_slug", label: "Service (empty = general package)", type: "select", optionsFrom: { table: "dv_services", value: "slug", label: "title_en" }, half: true },
      ...bi("price_note", "Short note"),
      { name: "features_en", label: "What's included (English) — one per line", type: "list" },
      { name: "features_sw", label: "What's included (Kiswahili) — one per line", type: "list" },
      { name: "sort", label: "Order", type: "number", half: true },
      { name: "featured", label: "Highlight as most popular", type: "checkbox", half: true },
      { name: "published", label: "Visible on website", type: "checkbox", half: true },
    ],
  },
  projects: {
    key: "projects", table: "dv_projects", label: "Projects", singular: "project",
    orderBy: "sort", titleField: "title_en", subtitleField: "client", imageField: "cover_url",
    fields: [
      ...bi("title", "Title", "text", true),
      { name: "slug", label: "URL name", type: "slug", required: true, half: true },
      { name: "client", label: "Client", type: "text", half: true },
      { name: "project_date", label: "Date", type: "date", half: true },
      { name: "cover_url", label: "Cover photo", type: "image" },
      ...bi("summary", "Summary", "textarea"),
      { name: "sort", label: "Order", type: "number", half: true },
      { name: "published", label: "Visible on website", type: "checkbox", half: true },
    ],
  },
  team: {
    key: "team", table: "dv_team_members", label: "Team", singular: "team member",
    orderBy: "sort", titleField: "name", subtitleField: "role_en", imageField: "photo_url",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true },
      ...bi("role", "Job title"),
      { name: "photo_url", label: "Photo", type: "image" },
      ...bi("responsibilities", "Responsibilities (one per line)", "textarea"),
      ...bi("bio", "Short biography", "textarea"),
      { name: "sort", label: "Order", type: "number", half: true },
      { name: "published", label: "Visible on website", type: "checkbox", half: true },
    ],
  },
  highlights: {
    key: "highlights", table: "dv_highlights", label: "Clients, Partners & Awards", singular: "highlight",
    orderBy: "sort", titleField: "title_en", subtitleField: "kind", imageField: "logo_url",
    fields: [
      { name: "kind", label: "Type", type: "select", required: true, half: true, options: [
        { value: "client", label: "Corporate client" }, { value: "partner", label: "Partner / collaboration" },
        { value: "award", label: "Award" }, { value: "certificate", label: "Certificate" }, { value: "press", label: "Press / media feature" },
      ] },
      { name: "year", label: "Year", type: "number", half: true },
      ...bi("title", "Name / title", "text", true),
      ...bi("description", "Short description", "textarea"),
      { name: "logo_url", label: "Logo (clients & partners — only with permission)", type: "image" },
      { name: "link", label: "Link (website or article)", type: "url" },
      { name: "sort", label: "Order", type: "number", half: true },
      { name: "published", label: "Visible on website", type: "checkbox", half: true },
    ],
  },
  testimonials: {
    key: "testimonials", table: "dv_testimonials", label: "Testimonials", singular: "testimonial",
    orderBy: "sort", titleField: "name", subtitleField: "organization", imageField: "photo_url",
    fields: [
      { name: "name", label: "Client name", type: "text", required: true, half: true },
      { name: "organization", label: "Company / event (optional)", type: "text", half: true },
      ...bi("quote", "Review", "textarea"),
      { name: "rating", label: "Stars (1–5)", type: "number", half: true },
      { name: "video_url", label: "Video testimonial (YouTube link)", type: "url", half: true },
      { name: "photo_url", label: "Client photo (only with permission)", type: "image" },
      { name: "sort", label: "Order", type: "number", half: true },
      { name: "approved", label: "Approved by client — show on website", type: "checkbox", half: true },
    ],
  },
};

export const BOOKING_STATUSES = ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"] as const;
export const INQUIRY_STATUSES = ["new", "read", "replied"] as const;
