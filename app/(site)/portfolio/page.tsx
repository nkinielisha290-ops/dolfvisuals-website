import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import PageHero from "@/components/PageHero";
import SectionHead from "@/components/SectionHead";
import Share from "@/components/Share";
import VideoShowcase, { type Film } from "@/components/VideoShowcase";
import { categoryLabel, getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getPortfolio, getSettings } from "@/lib/data";
import { toGallery } from "@/lib/view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Portfolio", description: "Wedding, graduation, event, corporate and commercial photography & videography by DOLF VISUALS." };

export default async function Portfolio({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const lang = await getLang();
  const t = getDict(lang);
  const sw = lang === "sw";
  const [items, settings] = await Promise.all([getPortfolio(), getSettings()]);

  // Real films first (portfolio items of type video). Until the client uploads films, show the showreels.
  const films: Film[] = items
    .filter((i) => i.media_type === "video" && i.video_url)
    .map((i) => ({ id: i.id, title: tr(i, "title", lang), category: categoryLabel(i.category, lang), poster: i.image_url, url: i.video_url! }));
  if (settings.hero_video_url) films.push({ id: "showreel", title: t.showreel, category: "DOLF VISUALS", poster: "/reels/reel-home.jpg", url: settings.hero_video_url });
  if (!films.length) {
    const reels: [string, string, string][] = [
      ["home", "Showreel", sw ? "Kazi mchanganyiko" : "Selected work"],
      ["story", "Showreel", sw ? "Harusi na matukio" : "Weddings & events"],
      ["studio", "Showreel", sw ? "Studio" : "Studio sessions"],
      ["corporate", "Showreel", sw ? "Kikampuni" : "Corporate portraits"],
    ];
    reels.forEach(([k, title, cat]) => films.push({ id: k, title: `${title} — ${cat}`, category: "DOLF VISUALS", poster: `/reels/reel-${k}.jpg`, url: `/reels/reel-${k}.mp4` }));
  }

  return (
    <>
      <PageHero page="portfolio" eyebrow={t.portfolio_eyebrow} title={t.portfolio_title} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-20">
        <Gallery items={toGallery(items.filter((i) => i.media_type === "image"), lang)} allLabel={t.all} closeLabel={t.gallery_close} initialCategory={c ?? "all"} />
      </section>
      <section className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 md:py-28">
          <SectionHead eyebrow={t.films_eyebrow} title={t.films_title} text={t.films_note} />
          <div className="reveal mt-12"><VideoShowcase films={films} /></div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <Share title="DOLF VISUALS — Portfolio" labels={{ share: t.share, copy: t.copy_link, copied: t.copied }} />
      </div>
    </>
  );
}
