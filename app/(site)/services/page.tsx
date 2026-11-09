import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getServices } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Services", description: "Wedding, graduation, event, corporate, product and commercial photography & videography in Dar es Salaam." };

export default async function Services() {
  const lang = await getLang();
  const t = getDict(lang);
  const services = await getServices();
  return (
    <>
      <PageHero eyebrow={t.services_eyebrow} title={t.services_title} image={services[0]?.cover_url} />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 md:py-28">
        <div className="divide-y divide-line border-y border-line">
          {services.map((s, i) => (
            <Link key={s.id} href={`/services/${s.slug}`} data-cursor="Explore" className="reveal card-shine group grid items-center gap-6 py-10 md:grid-cols-[80px_1fr_240px] md:gap-10">
              <span className="font-display text-3xl text-white/25 transition group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-heading text-2xl font-bold transition group-hover:text-gold sm:text-3xl">{tr(s, "title", lang)}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-white/55">{tr(s, "description", lang)}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-sub text-sm text-gold">{t.learn_more} <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </div>
              <div className="reveal-img relative hidden aspect-[4/3] overflow-hidden bg-ink-2 md:block">
                {s.cover_url ? (
                  <Image src={s.cover_url} alt="" fill sizes="240px" className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/brand/icon-gold.svg" alt="" className="absolute inset-0 m-auto w-1/3 opacity-30" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
