import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import PageHero from "@/components/PageHero";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getPortfolio, getProject } from "@/lib/data";
import { toGallery } from "@/lib/view";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return p ? { title: p.title_en, description: p.summary_en } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const t = getDict(lang);
  const p = await getProject(slug);
  if (!p) notFound();
  const items = (await getPortfolio()).filter((i) => i.project_slug === slug);
  return (
    <>
      <PageHero eyebrow={[p.client, p.project_date?.slice(0, 4)].filter(Boolean).join(" · ") || t.projects_eyebrow}
        title={tr(p, "title", lang)} text={tr(p, "summary", lang)} image={p.cover_url} />
      {items.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-24">
          <Gallery items={toGallery(items, lang)} allLabel={t.all} closeLabel={t.gallery_close} filter={false} />
        </section>
      )}
    </>
  );
}
