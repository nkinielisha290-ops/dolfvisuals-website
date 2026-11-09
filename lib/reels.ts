import type { Settings } from "./types";

export type Reel = { src: string; srcMobile: string | null; poster: string | null; posterMobile?: string | null };

const builtIn = (name: "home" | "story" | "corporate" | "studio"): Reel => ({
  src: `/reels/reel-${name}.mp4`, srcMobile: `/reels/reel-${name}-m.mp4`, poster: `/reels/reel-${name}.jpg`, posterMobile: `/reels/reel-${name}-m.jpg`,
});

/** Page → built-in reel (made from the client's own photos). A showreel set in Admin → Settings overrides all pages. */
const MAP: Record<string, Parameters<typeof builtIn>[0]> = {
  home: "home", about: "story", services: "story", portfolio: "studio", projects: "studio",
  pricing: "corporate", testimonials: "studio", contact: "corporate", booking: "home",
};

export function reelFor(page: keyof typeof MAP | string, settings: Pick<Settings, "hero_video_url" | "hero_video_mobile_url">): Reel {
  if (settings.hero_video_url) {
    return { src: settings.hero_video_url, srcMobile: settings.hero_video_mobile_url || null, poster: null };
  }
  return builtIn(MAP[page] ?? "home");
}
