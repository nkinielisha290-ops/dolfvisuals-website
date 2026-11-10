import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import Highlights from "@/components/Highlights";
import SectionHead from "@/components/SectionHead";
import SocialSection from "@/components/SocialSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import { SocialIcon } from "@/components/SocialIcons";
import Mosaic from "@/components/gallery/Mosaic";
import PhotoColumns from "@/components/gallery/PhotoColumns";
import PhotoMarquee from "@/components/gallery/PhotoMarquee";
import Counter from "@/components/motion/Counter";
import Magnetic from "@/components/motion/Magnetic";
import ScrollHighlight from "@/components/motion/ScrollHighlight";
import SplitText from "@/components/motion/SplitText";
import { CATEGORIES, categoryLabel, getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getHighlights, getPortfolio, getServices, getSettings, getTestimonials, waLink } from "@/lib/data";
import { photosFor, rotate } from "@/lib/photos";

export const revalidate = 60;

export default async function Home() {
  const lang = await getLang();
  const t = getDict(lang);
  const sw = lang === "sw";
  const [settings, services, portfolio, testimonials, highlights] = await Promise.all([
    getSettings(), getServices(), getPortfolio(), getTestimonials(), getHighlights(),
  ]);

  const photos = photosFor(portfolio, "home", lang);
  const pick = (i: number) => photos[i % Math.max(1, photos.length)];
  const byCat = (cat: string, i = 0) => photos.filter((p) => p.category.startsWith(cat))[i] ?? pick(i);

  // a bright, colourful frame for the photo set inside the headline
  const inline = byCat("graduation");
  const title = tr(settings, "hero_title", lang);
  const hw = title.split(" ");
  const heroLines = hw.length >= 3 ? [hw[0], hw[1], hw.slice(2).join(" ")] : [title];

  const work = portfolio.filter((p) => p.media_type !== "video").sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort);

  const stats = [
    { n: services.length, label: sw ? "Huduma" : "Services" },
    { n: CATEGORIES.length, label: sw ? "Aina za kazi" : "Portfolio categories" },
    { n: 2, label: sw ? "Lugha" : "Languages" },
    { n: 2025, label: sw ? "Mwaka tulioanza" : "Established" },
  ];

  return (
    <>
      {/* ================= HERO: words + drifting photo columns ================= */}
      <section className="relative isolate overflow-hidden pt-24 sm:pt-28">
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[40rem] rounded-full bg-gold/15 blur-3xl" />
        <div className="mx-auto grid max-w-[96rem] items-center gap-10 px-4 sm:px-8 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="py-8 lg:py-16">
            <p className="inline-flex animate-fadeup items-center gap-2 rounded-full border border-line bg-ink-2/70 px-4 py-2 font-sub text-[0.7rem] uppercase tracking-[0.2em] text-white/70 backdrop-blur [animation-delay:.1s]">
              <Sparkles className="size-3.5 text-gold" /> Photography · Videography · Creative Agency
            </p>

            <h1 aria-label={title} className="mt-7 font-display text-[clamp(3.6rem,7.6vw,8.6rem)] uppercase leading-[0.86] tracking-[0.01em] text-white">
              {heroLines.map((line, li) => (
                <span key={li} className="block">
                  {line.split(" ").map((w, i, arr) => (
                    <span key={i} className="word mr-[0.2em] last:mr-0">
                      <span className={li === heroLines.length - 1 && i === arr.length - 1 ? "text-gold" : ""} style={{ animationDelay: `${0.2 + li * 0.13 + i * 0.06}s` }}>{w}</span>
                    </span>
                  ))}
                  {/* a photo set inline in the headline, like a magazine cover */}
                  {li === 0 && pick(1) && (
                    <span aria-hidden className="relative ml-[0.15em] inline-block h-[0.72em] w-[1.5em] translate-y-[0.04em] overflow-hidden rounded-full align-baseline ring-4 ring-gold/30 animate-fadeup [animation-delay:.6s]">
                      <Image src={inline.src} alt="" fill sizes="200px" className="object-cover object-[50%_25%]" priority />
                    </span>
                  )}
                </span>
              ))}
            </h1>

            <p className="mt-8 max-w-xl animate-fadeup text-lg leading-relaxed text-white/65 [animation-delay:.7s]">{tr(settings, "hero_subtitle", lang)}</p>
            <div className="mt-9 flex flex-wrap gap-3 animate-fadeup [animation-delay:.85s]">
              <Magnetic><Link href="/portfolio" className="btn-gold">{t.hero_cta_work} <ArrowRight className="size-4" /></Link></Magnetic>
              <Magnetic><Link href="/booking" className="btn-ghost">{t.hero_cta_book}</Link></Magnetic>
            </div>

            <div className="mt-12 flex items-center gap-4 animate-fadeup [animation-delay:1s]">
              <div className="flex -space-x-3">
                {[2, 3, 4, 5].map((k) => pick(k) && (
                  <span key={k} className="relative size-11 overflow-hidden rounded-full ring-[3px] ring-ink"><Image src={pick(k).src} alt="" fill sizes="44px" className="object-cover object-top" /></span>
                ))}
              </div>
              <p className="text-sm leading-snug text-white/60">
                {sw ? "Harusi · Picha binafsi · Kampuni · Matukio" : "Weddings · Portraits · Corporate · Events"}<br />
                <span className="text-white/40">{tr(settings, "location", lang)}</span>
              </p>
            </div>
          </div>

          {/* desktop: moving columns */}
          <div className="relative hidden h-[calc(100svh-7rem)] lg:block [mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]">
            <PhotoColumns photos={photos} cols={3} className="h-full" speed={55} />
          </div>
        </div>
        {/* phones & tablets: two ribbons */}
        <div className="space-y-3 pb-6 lg:hidden">
          <PhotoMarquee photos={photos} height="h-56 sm:h-72" speed={55} />
          <PhotoMarquee photos={rotate(photos, 5)} height="h-56 sm:h-72" speed={65} reverse />
        </div>
      </section>

      {/* ================= TICKER ================= */}
      <div className="relative z-10 -rotate-1 overflow-hidden bg-gold py-4 text-on-gold shadow-lg" aria-hidden>
        <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-10 whitespace-nowrap">
          {[...services, ...services].map((s, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-3xl tracking-[0.08em] sm:text-4xl">
              {tr(s, "title", lang)} <span>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================= STATEMENT ================= */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-8 md:py-36">
        <p className="eyebrow eyebrow-line">{t.mission}</p>
        <ScrollHighlight
          className="mt-10 font-heading text-[clamp(1.9rem,4.6vw,4.2rem)] font-bold leading-[1.12] tracking-tight"
          highlight={sw ? ["hadithi", "kipekee", "kuona"] : ["exceptional", "visual", "stories"]}
          text={sw
            ? "Kunasa, kuunda na kukabidhi hadithi za kuona za kipekee — kupitia upigaji picha wa kitaalamu, video za kisinema na ubunifu wa vyombo vya habari."
            : "We capture, create and deliver exceptional visual stories — through professional photography, cinematic videography and creative media."} />
      </section>

      {/* ================= ABOUT: photo collage + story ================= */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-28 sm:px-8 md:pb-36 lg:grid-cols-2">
        <div className="relative grid grid-cols-[1.25fr_1fr] gap-3 sm:gap-4">
          <div className="reveal-img relative row-span-2 aspect-[3/4] overflow-hidden rounded-[1.75rem] sm:aspect-auto">
            <Image src={byCat("wedding").src} alt={byCat("wedding").alt} fill sizes="(min-width:1024px) 28vw, 55vw" className="object-cover transition-transform duration-1000 hover:scale-105" />
          </div>
          <div className="reveal-img relative aspect-square overflow-hidden rounded-[1.75rem] [transition-delay:.15s]">
            <Image src={byCat("commercial", 1).src} alt={byCat("commercial", 1).alt} fill sizes="(min-width:1024px) 22vw, 45vw" className="object-cover object-top transition-transform duration-1000 hover:scale-105" />
          </div>
          <div className="reveal-img relative aspect-[4/5] overflow-hidden rounded-[1.75rem] [transition-delay:.3s]">
            <Image src={byCat("graduation").src} alt={byCat("graduation").alt} fill sizes="(min-width:1024px) 22vw, 45vw" className="object-cover transition-transform duration-1000 hover:scale-105" />
          </div>
          <div className="reveal absolute -bottom-6 left-6 rounded-2xl bg-gold px-5 py-4 text-on-gold shadow-xl sm:left-10">
            <p className="font-display text-5xl leading-none">2025</p>
            <p className="font-sub text-[0.6rem] uppercase tracking-[0.2em]">{t.founded}</p>
          </div>
        </div>
        <div className="mt-6 lg:mt-0">
          <SectionHead eyebrow={t.about_eyebrow} title={t.about_title} />
          <p className="reveal mt-6 text-lg leading-relaxed text-white/65">
            {sw
              ? "DOLF VISUALS ilizaliwa tarehe 11 Oktoba 2025, baada ya mtangulizi wake KHAMY_PHOTOGRAPHY kupoteza kumbukumbu zake zote. Changamoto hiyo ikawa mwanzo mpya — fursa ya kujenga brand imara zaidi yenye malengo makubwa zaidi."
              : "DOLF VISUALS was born on 11 October 2025, after its predecessor KHAMY_PHOTOGRAPHY lost its entire archive. That setback became a new beginning — a chance to rebuild a stronger brand with bigger ambitions."}
          </p>
          <Link href="/about" className="reveal group mt-8 inline-flex items-center gap-2 font-sub text-sm text-gold">
            <span className="u-link">{t.about_more}</span> <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className="reveal rounded-2xl border border-line bg-ink-2 p-5" style={{ transitionDelay: `${i * 80}ms` }}>
                <dt className="font-display text-4xl leading-none text-white"><Counter to={s.n} from={s.n > 100 ? s.n - 25 : 0} duration={1600} /></dt>
                <dd className="mt-2 font-sub text-[0.6rem] uppercase tracking-[0.18em] text-white/45">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= SERVICES: picture cards ================= */}
      <section className="bg-ink-2 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <SectionHead eyebrow={t.services_eyebrow} title={t.services_title} />
            <Link href="/services" className="reveal group inline-flex items-center gap-2 font-sub text-sm text-gold">
              <span className="u-link">{t.services_all}</span> <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {services.map((s, i) => {
              const src = s.cover_url ?? pick(i + 3).src;
              return (
                <Link key={s.id} href={`/services/${s.slug}`} className="reveal group relative block break-inside-avoid overflow-hidden rounded-[1.75rem] bg-ink" style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                  <div className={`relative ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[5/6]"}`}>
                    <Image src={src} alt={tr(s, "title", lang)} fill sizes="(min-width:1024px) 31vw, (min-width:640px) 48vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.07]" />
                    <span className="absolute left-4 top-4 rounded-full bg-[#fff]/90 px-3 py-1 font-display text-lg leading-none tracking-wider text-[#111] backdrop-blur">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-[#fff]/95 p-4 text-[#111] shadow-xl backdrop-blur transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-heading text-lg font-bold leading-tight">{tr(s, "title", lang)}</h3>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#111] text-[#d4af37] transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="size-5" /></span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-black/60">{tr(s, "summary", lang)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SELECTED WORK: masonry wall ================= */}
      <section id="work" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t.portfolio_eyebrow} title={t.portfolio_title} />
          <Magnetic><Link href="/portfolio" className="btn-ghost">{t.portfolio_all} <ArrowRight className="size-4" /></Link></Magnetic>
        </div>
        <Mosaic items={work.map((p) => ({ src: p.image_url, title: tr(p, "title", lang), label: categoryLabel(p.category, lang), href: `/portfolio?c=${p.category}`, w: p.width, h: p.height }))} />
      </section>

      {/* ================= RIBBONS ================= */}
      <section className="overflow-hidden py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-7xl px-4 text-center sm:px-8">
          <p className="eyebrow justify-center">{sw ? "Kumbukumbu" : "Memories"}</p>
          <SplitText as="h2" text={sw ? "Matukio tuliyoyanasa" : "Moments we've captured"} step={0.05}
            className="mt-4 block font-display text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9] tracking-wide" />
        </div>
        <div className="space-y-4">
          <PhotoMarquee photos={rotate(photos, 2)} height="h-72 sm:h-96" speed={80} />
          <PhotoMarquee photos={rotate(photos, 8)} height="h-72 sm:h-96" speed={95} reverse />
        </div>
      </section>

      {/* ================= PROCESS with photos ================= */}
      <section className="bg-ink-2 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow={t.process_eyebrow} title={t.process_title} />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.process.map(([h, p], i) => (
              <li key={h} className="reveal group overflow-hidden rounded-[1.75rem] border border-line bg-ink" style={{ transitionDelay: `${i * 110}ms` }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  {pick(i + 6) && <Image src={pick(i + 6).src} alt="" fill sizes="(min-width:1024px) 23vw, 50vw" className="object-cover object-[50%_30%] transition-transform duration-1000 group-hover:scale-105" />}
                  <span className="absolute left-4 top-4 grid size-12 place-items-center rounded-full bg-gold font-display text-2xl text-on-gold shadow-lg">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold">{h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= TESTIMONIALS (only real, approved) ================= */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
          <p className="eyebrow eyebrow-line">{t.testi_eyebrow}</p>
          <div className="reveal mt-10">
            <TestimonialSlider slides={testimonials.map((x) => ({ id: x.id, quote: tr(x, "quote", lang), name: x.name, organization: x.organization, photo: x.photo_url, rating: x.rating }))} />
          </div>
        </section>
      )}

      <Highlights items={highlights} lang={lang} />

      <SocialSection settings={settings} lang={lang} />

      {/* ================= CTA: gold card + photo grid ================= */}
      <section className="px-4 pb-24 sm:px-8 md:pb-32">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 overflow-hidden rounded-[2.25rem] bg-gold p-8 text-on-gold sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-16">
          <div aria-hidden className="absolute -left-20 -top-20 size-72 rounded-full bg-[#fff]/25 blur-3xl" />
          <div className="relative">
            <p className="font-sub text-xs font-semibold uppercase tracking-[0.3em]">{t.book_eyebrow}</p>
            <SplitText as="h2" text={t.cta_title} step={0.06}
              className="mt-5 block font-display text-[clamp(3.2rem,7vw,6.5rem)] uppercase leading-[0.88] tracking-wide" />
            <p className="reveal mt-6 max-w-md text-lg text-black/70">{t.cta_text}</p>
            <div className="reveal mt-10 flex flex-wrap gap-3">
              <Magnetic><Link href="/booking" className="inline-flex items-center gap-2 rounded-full bg-[#111] px-8 py-4 font-sub text-sm font-semibold text-[#fff] transition hover:-translate-y-0.5 hover:shadow-xl">{t.nav_book} <ArrowRight className="size-4" /></Link></Magnetic>
              <Magnetic><a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-[#111] px-8 py-4 font-sub text-sm font-semibold transition hover:bg-[#111] hover:text-[#fff]">
                <SocialIcon name="whatsapp" className="size-4" /> {t.whatsapp_us}
              </a></Magnetic>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {[0, 1, 2, 3].map((k) => pick(k + 9) && (
              <div key={k} className={`reveal-img relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl ${k % 2 ? "translate-y-8" : ""}`} style={{ transitionDelay: `${k * 0.1}s` }}>
                <Image src={pick(k + 9).src} alt="" fill sizes="(min-width:1024px) 20vw, 45vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
