import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Gallery from "@/components/Gallery";
import SectionHead from "@/components/SectionHead";
import { SocialIcon } from "@/components/SocialIcons";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getPortfolio, getServices, getSettings, getTestimonials, waLink } from "@/lib/data";
import { toGallery } from "@/lib/view";

export const revalidate = 60;

export default async function Home() {
  const lang = await getLang();
  const t = getDict(lang);
  const [settings, services, portfolio, testimonials] = await Promise.all([
    getSettings(), getServices(), getPortfolio(), getTestimonials(),
  ]);

  const featured = portfolio.filter((p) => p.featured);
  const heroPool = (featured.length >= 6 ? featured : portfolio).slice(0, 9);
  const columns = [0, 1, 2].map((c) => heroPool.filter((_, i) => i % 3 === c));
  const bg = heroPool[0]?.image_url;
  const title = tr(settings, "hero_title", lang);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden lg:items-center">
        {bg && (
          <div className="absolute inset-0 -z-20 lg:hidden">
            <Image src={bg} alt="" fill priority sizes="100vw" className="animate-kenburns object-cover object-[50%_25%]" />
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/30 lg:bg-none" />

        {/* moving photo columns (desktop) */}
        <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[54%] grid-cols-3 gap-4 overflow-hidden px-4 lg:grid">
          {columns.map((col, c) => (
            <div key={c} className={`flex flex-col gap-4 ${c === 1 ? "animate-[colup_60s_linear_infinite]" : "animate-[coldown_70s_linear_infinite]"}`}>
              {[...col, ...col, ...col].map((p, i) => (
                <div key={`${p.id}-${i}`} className="relative aspect-[4/5] w-full shrink-0 overflow-hidden">
                  <Image src={p.image_url} alt="" fill sizes="18vw" priority={i < 2} className="object-cover" />
                </div>
              ))}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/90" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-8 lg:pb-0">
          <div className="max-w-2xl">
            <p className="eyebrow animate-fadeup [animation-delay:.2s]">Photography · Videography · Creative Agency</p>
            <h1 className="mt-6 font-display text-[clamp(4rem,11vw,9.5rem)] leading-[0.86] tracking-wide text-white">
              {title.split(" ").map((w, i, arr) => (
                <span key={i} className="word mr-[0.22em]">
                  <span className={i === arr.length - 1 ? "text-gold" : ""} style={{ animationDelay: `${0.35 + i * 0.09}s` }}>{w}</span>
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-white/70 animate-fadeup [animation-delay:.75s] sm:text-lg">
              {tr(settings, "hero_subtitle", lang)}
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-fadeup [animation-delay:.9s]">
              <Link href="/portfolio" className="btn-gold">{t.hero_cta_work} <ArrowRight className="size-4" /></Link>
              <Link href="/booking" className="btn-ghost">{t.hero_cta_book}</Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
          <span className="font-sub text-[0.6rem] uppercase tracking-[0.4em] text-white/40">{t.scroll}</span>
          <span className="h-10 w-px bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* ---------------- SERVICE TICKER ---------------- */}
      <div className="overflow-hidden border-y border-line bg-ink-2 py-5" aria-hidden>
        <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-10 whitespace-nowrap">
          {[...services, ...services].map((s, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-3xl tracking-[0.08em] text-white/80 sm:text-4xl">
              {tr(s, "title", lang)} <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- ABOUT TEASER ---------------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-8 md:py-32 lg:grid-cols-2">
        <div className="relative">
          <div className="reveal-img relative aspect-[4/5] w-4/5 overflow-hidden">
            <Image src={portfolio.find((p) => p.category.startsWith("wedding"))?.image_url ?? portfolio[0].image_url} alt="" fill sizes="(min-width:1024px) 40vw, 80vw" className="object-cover" />
          </div>
          <div className="reveal-img absolute -bottom-10 right-0 aspect-[4/5] w-1/2 overflow-hidden border-8 border-ink [transition-delay:.25s]">
            <Image src={portfolio[1]?.image_url ?? portfolio[0].image_url} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="absolute -left-2 top-8 bg-gold px-4 py-3 text-ink sm:-left-4">
            <p className="font-display text-4xl leading-none">2025</p>
            <p className="font-sub text-[0.6rem] uppercase tracking-[0.2em]">{t.founded}</p>
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
          <SectionHead eyebrow={t.about_eyebrow} title={t.about_title} />
          <p className="reveal mt-6 text-lg leading-relaxed text-white/65">
            {lang === "sw"
              ? "DOLF VISUALS ilizaliwa tarehe 11 Oktoba 2025, baada ya mtangulizi wake KHAMY_PHOTOGRAPHY kupoteza kumbukumbu zake zote. Changamoto hiyo ikawa mwanzo mpya — fursa ya kujenga brand imara zaidi yenye malengo makubwa zaidi."
              : "DOLF VISUALS was born on 11 October 2025, after its predecessor KHAMY_PHOTOGRAPHY lost its entire archive. That setback became a new beginning — a chance to rebuild a stronger brand with bigger ambitions."}
          </p>
          <p className="reveal mt-4 leading-relaxed text-white/50">
            {lang === "sw"
              ? "Mwaka mmoja baadaye, tunaendelea kujenga brand yenye uwezo wa kushindana kwa viwango vya kimataifa — kwa ubunifu, umakini na weledi."
              : "One year on, we're building a brand capable of competing at international production standards — with creativity, precision and professionalism."}
          </p>
          <Link href="/about" className="reveal mt-10 inline-flex items-center gap-2 font-sub text-sm text-gold hover:gap-3 transition-all">
            {t.about_more} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="bg-cream text-ink">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead eyebrow={t.services_eyebrow} title={t.services_title} dark={false} />
            <Link href="/services" className="reveal inline-flex items-center gap-2 font-sub text-sm hover:text-gold">{t.services_all} <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-14 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Link key={s.id} href={`/services/${s.slug}`} style={{ transitionDelay: `${(i % 3) * 90}ms` }} className="reveal group relative flex min-h-64 flex-col justify-between overflow-hidden bg-cream p-8 transition-colors duration-500 hover:bg-ink">
                {s.cover_url && (
                  <Image src={s.cover_url} alt="" fill sizes="(min-width:1024px) 33vw, 50vw"
                    className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-40" />
                )}
                <div className="relative flex items-start justify-between">
                  <span className="font-display text-2xl text-ink/30 transition group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpRight className="size-5 text-ink/30 transition group-hover:rotate-45 group-hover:text-gold" />
                </div>
                <div className="relative mt-10">
                  <h3 className="font-heading text-xl font-bold transition group-hover:text-white">{tr(s, "title", lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60 transition group-hover:text-white/70">{tr(s, "summary", lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SELECTED WORK ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t.portfolio_eyebrow} title={t.portfolio_title} />
          <Link href="/portfolio" className="reveal inline-flex items-center gap-2 font-sub text-sm text-gold">{t.portfolio_all} <ArrowRight className="size-4" /></Link>
        </div>
        <div className="reveal">
          <Gallery items={toGallery((featured.length ? featured : portfolio).slice(0, 8), lang)} allLabel={t.all} closeLabel={t.gallery_close} filter={false} />
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-28">
          <SectionHead eyebrow={t.process_eyebrow} title={t.process_title} />
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {t.process.map(([h, p], i) => (
              <li key={h} className="reveal border-t border-gold/40 pt-6" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="font-display text-5xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-heading text-lg font-bold">{h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS (only real, approved ones) ---------------- */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
          <SectionHead eyebrow={t.testi_eyebrow} title={t.testi_title} />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((x) => (
              <figure key={x.id} className="reveal border border-line p-8">
                <span className="font-display text-6xl leading-none text-gold">“</span>
                <blockquote className="mt-2 leading-relaxed text-white/75">{tr(x, "quote", lang)}</blockquote>
                <figcaption className="mt-6 font-sub text-sm">
                  <span className="text-white">{x.name}</span>
                  {x.organization && <span className="block text-white/40">{x.organization}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      <section className="relative isolate overflow-hidden">
        <Image src={portfolio.find((p) => p.category === "graduation")?.image_url ?? portfolio[0].image_url} alt="" fill sizes="100vw" className="parallax -z-20 object-cover object-[50%_40%] opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-8 md:py-36">
          <h2 className="reveal max-w-3xl font-display text-6xl leading-[0.9] tracking-wide sm:text-7xl md:text-8xl">{t.cta_title}</h2>
          <p className="reveal mt-6 max-w-lg text-lg text-white/65">{t.cta_text}</p>
          <div className="reveal mt-10 flex flex-wrap gap-3">
            <Link href="/booking" className="btn-gold">{t.nav_book} <ArrowRight className="size-4" /></Link>
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <SocialIcon name="whatsapp" className="size-4" /> {t.whatsapp_us}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
