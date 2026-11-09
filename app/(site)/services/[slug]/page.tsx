import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import Gallery from "@/components/Gallery";
import PageHero from "@/components/PageHero";
import { getDict, tr, trList } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { formatTZS, getPackages, getPortfolio, getService } from "@/lib/data";
import { toGallery } from "@/lib/view";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await getService((await params).slug);
  return s ? { title: s.title_en, description: s.summary_en } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const t = getDict(lang);
  const s = await getService(slug);
  if (!s) notFound();
  const [portfolio, packages] = await Promise.all([getPortfolio(), getPackages()]);
  const work = portfolio.filter((p) => p.category === s.portfolio_category);
  const pkgs = packages.filter((p) => p.service_slug === s.slug);

  return (
    <>
      <PageHero page="services" eyebrow={t.nav_services} title={tr(s, "title", lang)} text={tr(s, "summary", lang)} image={s.cover_url} />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-8 md:grid-cols-[1.4fr_1fr] md:py-28">
        <p className="reveal text-xl leading-relaxed text-white/75 sm:text-2xl">{tr(s, "description", lang)}</p>
        <div className="reveal md:justify-self-end">
          <Link href={`/booking?service=${s.slug}`} className="btn-gold">{t.service_book} <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      {pkgs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
          <p className="eyebrow reveal">{t.service_packages}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {pkgs.map((p) => (
              <div key={p.id} className={`reveal border p-8 ${p.featured ? "border-gold" : "border-line"}`}>
                <h3 className="font-heading text-xl font-bold">{tr(p, "name", lang)}</h3>
                <p className="mt-3 font-display text-4xl text-gold">{p.price ? formatTZS(p.price) : t.on_request}</p>
                <ul className="mt-6 space-y-2 text-sm text-white/70">
                  {trList(p, "features", lang).map((f) => <li key={f} className="flex gap-2"><Check className="size-4 shrink-0 text-gold" />{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {work.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
          <p className="eyebrow reveal mb-8">{t.service_gallery}</p>
          <Gallery items={toGallery(work, lang)} allLabel={t.all} closeLabel={t.gallery_close} filter={false} />
        </section>
      )}
    </>
  );
}
