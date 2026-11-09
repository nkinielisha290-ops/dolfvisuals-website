/**
 * Public data access. Reads from Supabase when configured, otherwise falls back
 * to the built-in seed content so the site always renders.
 */
import { cache } from "react";
import { hasSupabase } from "./supabase/config";
import { supabasePublic } from "./supabase/server";
import {
  seedPackages, seedPortfolio, seedProjects, seedServices, seedSettings, seedTeam, seedTestimonials,
} from "./seed";
import type { Highlight, Package, PortfolioItem, Project, Service, Settings, TeamMember, Testimonial } from "./types";

async function fromTable<T>(table: string, fallback: T[], filter: Record<string, unknown>, order = "sort"): Promise<T[]> {
  if (!hasSupabase) return fallback;
  try {
    let q = supabasePublic().from(table).select("*");
    for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
    const { data, error } = await q.order(order, { ascending: true });
    if (error) throw error;
    return (data ?? []) as T[];
  } catch (e) {
    console.error(`[data] ${table}:`, e);
    return fallback;
  }
}

export const getSettings = cache(async (): Promise<Settings> => {
  if (!hasSupabase) return seedSettings;
  try {
    const { data, error } = await supabasePublic().from("dv_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return { ...seedSettings, ...(data ?? {}) } as Settings;
  } catch (e) {
    console.error("[data] settings:", e);
    return seedSettings;
  }
});

export const getServices = cache(() => fromTable<Service>("dv_services", seedServices, { published: true }));
export const getPackages = cache(() => fromTable<Package>("dv_packages", seedPackages, { published: true }));
export const getPortfolio = cache(() => fromTable<PortfolioItem>("dv_portfolio_items", seedPortfolio, { published: true }));
export const getProjects = cache(() => fromTable<Project>("dv_projects", seedProjects, { published: true }));
export const getTeam = cache(() => fromTable<TeamMember>("dv_team_members", seedTeam, { published: true }));
export const getHighlights = cache(() => fromTable<Highlight>("dv_highlights", [], { published: true }));
export const getTestimonials = cache(() => fromTable<Testimonial>("dv_testimonials", seedTestimonials, { approved: true }));

export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}
export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export function waLink(number: string, text?: string) {
  const n = number.replace(/[^\d]/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function formatTZS(n: number) {
  return `TSh ${n.toLocaleString("en-US")}`;
}
