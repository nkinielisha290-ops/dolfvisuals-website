import Image from "next/image";
import SocialSection from "@/components/SocialSection";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Highlights from "@/components/Highlights";
import SectionHead from "@/components/SectionHead";
import TestimonialSlider from "@/components/TestimonialSlider";
import { SocialIcon } from "@/components/SocialIcons";
import BgVideo from "@/components/motion/BgVideo";
import Counter from "@/components/motion/Counter";
import HorizontalScroll from "@/components/motion/HorizontalScroll";
import Magnetic from "@/components/motion/Magnetic";
import RotatingBadge from "@/components/motion/RotatingBadge";
import ScrollHighlight from "@/components/motion/ScrollHighlight";
import SplitText from "@/components/motion/SplitText";
import { CATEGORIES, categoryLabel, getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getHighlights, getPortfolio, getServices, getSettings, getTestimonials, waLink } from "@/lib/data";
import { reelFor } from "@/lib/reels";

export const revalidate = 60;

/** Editorial grid rhythm for featured work (12-col on desktop). */
const LAYOUT = [
  "lg:col-span-7 aspect-[4/5]",
  "lg:col-span-5 aspect-[4/5] lg:mt-40",
  "lg:col-span-4 aspect-[3/4]",
  "lg:col-span-4 aspect-[3/4] lg:mt-24",
  "lg:col-span-4 aspect-[3/4]",
  "lg:col-span-5 aspect-[4/5] lg:-mt-10",
  "lg:col-span-7 aspect-[5/4] lg:mt-24",
];

export default async function Home() {
  const lang = await getLang();
  const t = getDict(lang);
  const sw = lang === "sw";
  const [settings, services, portfolio, testimonials, highlights] = await Promise.all([
    getSettings(), getServices(), getPortfolio(), getTestimonials(), getHighlights(),
  ]);

  const featured = portfolio.filter((p) => p.featured);
  const heroPool = (featured.length >= 6 ? featured : portfolio).slice(0, 9);
  const bg = heroPool[0]?.image_url;
  const reel = reelFor("home", settings);
  const title = tr(settings, "hero_title", lang);
  // split the headline into 3 balanced lines: "Turning" / "moments" / "into art"
  const hw = title.split(" ");
  const heroLines = hw.length >= 3 ? [hw[0], hw[1], hw.slice(2).join(" ")] : [title];
  const work = (featured.length ? featured : portfolio).slice(0, LAYOUT.length);
  const img = (cat: string, i = 0) => portfolio.filter((p) => p.category.startsWith(cat))[i]?.image_url ?? portfolio[i]?.image_url;

  const stats = [
    { n: services.length, label: sw ? "Huduma" : "Services" },
    { n: CATEGORIES.length, label: sw ? "Aina za kazi" : "Portfolio categories" },
    { n: 2, label: sw ? "Lugha" : "Languages" },
    { n: 2025, label: sw ? "Mwaka tulioanza" : "Established" },
  ];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="theme-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <BgVideo src={reel.src} srcMobile={reel.srcMobile} poster={reel.poster ?? bg} className="-z-20"
          toggle toggleClassName="absolute right-4 top-24 z-10 sm:right-8 sm:top-28" labels={sw ? { pause: "Simamisha video", play: "Cheza video" } : undefined} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

        <div className="text-shadow-hero mx-auto flex w-full max-w-[96rem] flex-1 flex-col justify-end px-4 pb-8 pt-32 sm:px-8 lg:pb-10">
          <p className="eyebrow animate-fadeup [animation-delay:.2s]">
            <span className="mr-3 inline-flex items-center gap-2 border border-white/30 px-2.5 py-1 align-middle text-[0.6rem] tracking-[0.25em] backdrop-blur-sm">
              <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500" /><span className="relative inline-flex size-1.5 rounded-full bg-red-500" /></span>
              Showreel
            </span>
            Photography · Videography · Creative Agency
          </p>

          <h1 aria-label={title} className="mt-6 font-display text-[clamp(4.2rem,13.5vw,14rem)] uppercase leading-[0.82] tracking-[0.01em] text-white">
            {heroLines.map((line, li) => (
              <span key={li} className={`block ${li === 1 ? "text-outline-hero pl-[8vw]" : ""} ${li === heroLines.length - 1 ? "text-right sm:text-left sm:pl-[22vw]" : ""}`}>
                {line.split(" ").map((w, i) => (
                  <span key={i} className="word mr-[0.2em] last:mr-0">
                    <span className={`${li === heroLines.length - 1 && i === line.split(" ").length - 1 ? "text-gold" : ""}`}
                      style={{ animationDelay: `${0.3 + li * 0.14 + i * 0.06}s` }}>{w}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <div className="mt-10 grid items-end gap-8 border-t border-white/25 pt-8 animate-fadeup [animation-delay:1s] md:grid-cols-[1fr_auto] lg:grid-cols-[1.1fr_1fr_auto]">
            <p className="max-w-md text-base leading-relaxed text-white/85 sm:text-lg">{tr(settings, "hero_subtitle", lang)}</p>
            <div className="flex flex-wrap gap-3 lg:justify-center">
              <Magnetic><Link href="/portfolio" className="btn-gold">{t.hero_cta_work} <ArrowRight className="size-4" /></Link></Magnetic>
              <Magnetic><Link href="/booking" className="btn-ghost">{t.hero_cta_book}</Link></Magnetic>
            </div>
            <RotatingBadge href="#work" label={t.scroll} className="hidden md:mr-16 md:grid"
              text={`DOLF VISUALS • EST. 2025 • ${tr(settings, "location", lang).split(",")[0].toUpperCase()} • `} />
          </div>
        </div>
      </section>

      {/* ================= TICKER ================= */}
      <div className="overflow-hidden border-y border-line bg-ink-2 py-5" aria-hidden>
        <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-10 whitespace-nowrap">
          {[...services, ...services].map((s, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-3xl tracking-[0.08em] text-white/80 sm:text-4xl">
              {tr(s, "title", lang)} <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================= STATEMENT ================= */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-8 md:py-40">
        <p className="eyebrow eyebrow-line">{t.mission}</p>
        <ScrollHighlight
          className="mt-10 font-heading text-[clamp(1.9rem,4.6vw,4.2rem)] font-bold leading-[1.12] tracking-tight"
          highlight={sw ? ["hadithi", "kipekee", "kuona"] : ["exceptional", "visual", "stories"]}
          text={sw
            ? "Kunasa, kuunda na kukabidhi hadithi za kuona za kipekee — kupitia upigaji picha wa kitaalamu, video za kisinema na ubunifu wa vyombo vya habari."
            : "We capture, create and deliver exceptional visual stories — through professional photography, cinematic videography and creative media."} />
      </section>

      {/* ================= ABOUT + STATS ================= */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 sm:px-8 md:pb-32 lg:grid-cols-2">
        <div className="relative">
          <div className="reveal-img img-hover relative aspect-[4/5] w-4/5 overflow-hidden" data-cursor="Story">
            <Image src={img("wedding")} alt="" fill sizes="(min-width:1024px) 40vw, 80vw" className="object-cover" />
          </div>
          <div className="reveal-img img-hover absolute -bottom-10 right-0 aspect-[4/5] w-1/2 overflow-hidden border-8 border-ink [transition-delay:.25s]">
            <Image src={img("commercial")} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="reveal absolute -left-2 top-8 bg-gold px-4 py-3 text-on-gold sm:-left-4">
            <p className="font-display text-4xl leading-none">2025</p>
            <p className="font-sub text-[0.6rem] uppercase tracking-[0.2em]">{t.founded}</p>
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
          <SectionHead eyebrow={t.about_eyebrow} title={t.about_title} />
          <p className="reveal mt-6 text-lg leading-relaxed text-white/65">
            {sw
              ? "DOLF VISUALS ilizaliwa tarehe 11 Oktoba 2025, baada ya mtangulizi wake KHAMY_PHOTOGRAPHY kupoteza kumbukumbu zake zote. Changamoto hiyo ikawa mwanzo mpya — fursa ya kujenga brand imara zaidi yenye malengo makubwa zaidi."
              : "DOLF VISUALS was born on 11 October 2025, after its predecessor KHAMY_PHOTOGRAPHY lost its entire archive. That setback became a new beginning — a chance to rebuild a stronger brand with bigger ambitions."}
          </p>
          <Link href="/about" className="reveal group mt-8 inline-flex items-center gap-2 font-sub text-sm text-gold">
            <span className="u-link">{t.about_more}</span> <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <dl className="mt-14 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className="reveal bg-ink py-6 pr-4" style={{ transitionDelay: `${i * 80}ms` }}>
                <dt className="font-display text-5xl leading-none text-white"><Counter to={s.n} from={s.n > 100 ? s.n - 25 : 0} duration={1600} /></dt>
                <dd className="mt-2 font-sub text-[0.65rem] uppercase tracking-[0.2em] text-white/45">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= SERVICES (horizontal pinned) ================= */}
      <section className="border-y border-line bg-ink-2">
        <HorizontalScroll header={
          <div className="mx-auto mb-12 flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-8">
            <SectionHead eyebrow={t.services_eyebrow} title={t.services_title} />
            <Link href="/services" className="reveal group inline-flex items-center gap-2 font-sub text-sm text-gold">
              <span className="u-link">{t.services_all}</span> <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        }>
          {services.map((s, i) => (
            <Link key={s.id} href={`/services/${s.slug}`} data-cursor={sw ? "Fungua" : "Explore"}
              className="theme-dark card-shine img-hover group relative flex aspect-[3/4] w-[78vw] shrink-0 snap-start flex-col justify-between overflow-hidden border border-white/10 bg-ink p-7 sm:w-[44vw] lg:w-[min(28vw,420px)]">
              {s.cover_url ? (
                <Image src={s.cover_url} alt="" fill sizes="(min-width:1024px) 28vw, 78vw" className="object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/brand/icon-gold.svg" alt="" className="absolute right-6 top-1/3 w-1/3 opacity-15" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="relative flex items-start justify-between">
                <span className="font-display text-5xl leading-none text-white/25 transition-colors duration-500 group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="grid size-11 place-items-center rounded-full border border-white/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-on-gold">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
              <div className="relative">
                <h3 className="font-heading text-2xl font-bold leading-tight">{tr(s, "title", lang)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 transition-all duration-700 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
                  {tr(s, "summary", lang)}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalScroll>
      </section>

      {/* ================= SELECTED WORK (editorial) ================= */}
      <section id="work" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-28 sm:px-8 md:py-36">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t.portfolio_eyebrow} title={t.portfolio_title} />
          <Magnetic><Link href="/portfolio" className="btn-ghost" data-cursor="View">{t.portfolio_all} <ArrowRight className="size-4" /></Link></Magnetic>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16">
          {work.map((p, i) => {
            const cls = LAYOUT[i].split(" ");
            const wide = i === 0 || i === 6;
            return (
              <Link key={p.id} href={`/portfolio?c=${p.category}`} data-cursor="View"
                className={`group ${wide ? "col-span-2" : "col-span-1"} ${cls.filter((c) => c.startsWith("lg:")).join(" ")}`}>
                <div className={`reveal-img img-hover relative overflow-hidden bg-ink-2 ${cls.filter((c) => c.startsWith("aspect")).join(" ")}`}
                  style={{ transitionDelay: `${(i % 3) * 120}ms` }}>
                  <Image src={p.image_url} alt={tr(p, "title", lang)} fill sizes={wide ? "(min-width:1024px) 58vw, 100vw" : "(min-width:1024px) 34vw, 50vw"} className="object-cover" />
                </div>
                <div className="reveal mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-sub text-sm text-white transition-colors group-hover:text-gold sm:text-base">{tr(p, "title", lang)}</p>
                  <p className="font-sub text-[0.62rem] uppercase tracking-[0.2em] text-white/40">{categoryLabel(p.category, lang)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="border-y border-line bg-cream text-ink">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
          <SectionHead eyebrow={t.process_eyebrow} title={t.process_title} dark={false} />
          <ol className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {t.process.map(([h, p], i) => (
              <li key={h} className="reveal group" style={{ transitionDelay: `${i * 110}ms` }}>
                <span className="block h-px w-full bg-ink/10"><span className="draw-line block h-px bg-gold" style={{ transitionDelay: `${0.2 + i * 0.15}s` }} /></span>
                <span className="mt-6 block font-display text-6xl leading-none text-ink/15 transition-colors duration-500 group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-heading text-lg font-bold">{h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{p}</p>
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

      {/* ================= CTA ================= */}
      <section className="theme-dark relative isolate overflow-hidden">
        <Image src={img("graduation")} alt="" fill sizes="100vw" className="parallax -z-20 object-cover object-[50%_40%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
        <div className="text-shadow-hero mx-auto max-w-7xl px-4 py-32 sm:px-8 md:py-44">
          <p className="eyebrow eyebrow-line">{t.book_eyebrow}</p>
          <SplitText as="h2" text={t.cta_title} step={0.06}
            className="mt-6 block max-w-4xl font-display text-6xl leading-[0.9] tracking-wide sm:text-7xl md:text-[7.5rem]" />
          <p className="reveal mt-8 max-w-lg text-lg text-white/65">{t.cta_text}</p>
          <div className="reveal mt-12 flex flex-wrap gap-3">
            <Magnetic><Link href="/booking" className="btn-gold !px-8 !py-5" data-cursor="Book">{t.nav_book} <ArrowRight className="size-4" /></Link></Magnetic>
            <Magnetic><a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-8 !py-5" data-cursor="Chat">
              <SocialIcon name="whatsapp" className="size-4" /> {t.whatsapp_us}
            </a></Magnetic>
          </div>
        </div>
      </section>
    </>
  );
}
