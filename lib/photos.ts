import type { PortfolioItem } from "./types";

export type Photo = { src: string; alt: string; category: string };

/** Which portfolio categories lead on each page (falls back to everything else after them). */
const PREFER: Record<string, string[]> = {
  home: [],
  about: ["commercial", "graduation", "wedding"],
  services: ["corporate", "commercial", "events"],
  portfolio: ["wedding", "commercial", "events", "graduation"],
  projects: ["events", "corporate", "commercial"],
  pricing: ["wedding", "graduation", "commercial"],
  testimonials: ["graduation", "commercial", "wedding"],
  contact: ["commercial", "events", "corporate"],
  booking: ["wedding", "graduation", "commercial"],
  account: ["commercial", "wedding", "graduation"],
};

/** Image items only, ordered for a page: preferred categories first, then featured, then the rest. */
export function photosFor(items: PortfolioItem[], page = "home", lang: "en" | "sw" = "en"): Photo[] {
  const imgs = items.filter((p) => p.media_type !== "video" && p.image_url);
  const pref = PREFER[page] ?? [];
  const rank = (p: PortfolioItem) => {
    const i = pref.findIndex((c) => p.category.startsWith(c));
    return (i === -1 ? 50 : i * 2) + (p.featured ? 0 : 1);
  };
  // spread categories so neighbours differ
  const sorted = [...imgs].sort((a, b) => rank(a) - rank(b) || a.sort - b.sort);
  const out: PortfolioItem[] = [];
  const pool = [...sorted];
  while (pool.length) {
    const last = out[out.length - 1]?.category;
    const k = pool.findIndex((p) => p.category !== last);
    out.push(pool.splice(k === -1 ? 0 : k, 1)[0]);
  }
  return out.map((p) => ({ src: p.image_url, alt: (lang === "sw" ? p.title_sw : p.title_en) || "DOLF VISUALS", category: p.category }));
}

/** Rotate a list so different pages start from a different photo. */
export function rotate<T>(list: T[], by: number) {
  if (!list.length) return list;
  const k = ((by % list.length) + list.length) % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
}
