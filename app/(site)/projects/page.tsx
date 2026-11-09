import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getProjects } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Projects", description: "Selected creative projects and case studies by DOLF VISUALS." };

export default async function Projects() {
  const lang = await getLang();
  const t = getDict(lang);
  const projects = await getProjects();
  return (
    <>
      <PageHero eyebrow={t.projects_eyebrow} title={t.projects_title} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-24">
        {projects.length === 0 ? (
          <p className="border border-dashed border-line p-12 text-center text-white/45">{t.projects_empty}</p>
        ) : (
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {projects.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className={`reveal group ${i % 2 ? "md:mt-24" : ""}`}>
                <div className="reveal-img relative aspect-[4/5] overflow-hidden bg-ink-2">
                  {p.cover_url && <Image src={p.cover_url} alt={tr(p, "title", lang)} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
                </div>
                <p className="eyebrow mt-6">{[p.client, p.project_date?.slice(0, 4)].filter(Boolean).join(" · ")}</p>
                <h2 className="mt-2 font-display text-5xl tracking-wide transition group-hover:text-gold">{tr(p, "title", lang)}</h2>
                <p className="mt-2 max-w-md text-white/55">{tr(p, "summary", lang)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
