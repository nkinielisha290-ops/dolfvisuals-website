import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import PageHero from "@/components/PageHero";
import { getDict } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getPortfolio } from "@/lib/data";
import { toGallery } from "@/lib/view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Portfolio", description: "Wedding, graduation, event, corporate and commercial photography & videography by DOLF VISUALS." };

export default async function Portfolio({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const lang = await getLang();
  const t = getDict(lang);
  const items = await getPortfolio();
  return (
    <>
      <PageHero page="portfolio" eyebrow={t.portfolio_eyebrow} title={t.portfolio_title} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-20">
        <Gallery items={toGallery(items, lang)} allLabel={t.all} closeLabel={t.gallery_close} initialCategory={c ?? "all"} />
      </section>
    </>
  );
}
