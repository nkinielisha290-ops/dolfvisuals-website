import type { MetadataRoute } from "next";
import { getProjects, getServices } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dolfvisuals.com";
  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  const pages = ["", "/about", "/services", "/portfolio", "/projects", "/pricing", "/testimonials", "/contact", "/booking"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.6 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: 0.5 })),
  ];
}
