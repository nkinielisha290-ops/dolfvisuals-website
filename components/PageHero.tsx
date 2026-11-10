import Link from "next/link";
import PhotoMarquee from "./gallery/PhotoMarquee";
import Prints from "./gallery/Prints";
import { getPortfolio } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { photosFor, rotate } from "@/lib/photos";

const OFFSET: Record<string, number> = { about: 1, services: 3, portfolio: 0, projects: 5, pricing: 7, testimonials: 2, contact: 9, booking: 4 };

/**
 * Inner-page hero: big editorial title on the left, three photo prints fanned out on the right,
 * and a ribbon of photos running underneath.
 */
export default async function PageHero({ eyebrow, title, text, page, image }: { eyebrow: string; title: string; text?: string; page: string; image?: string | null }) {
  const [portfolio, lang] = await Promise.all([getPortfolio(), getLang()]);
  const t = getDict(lang);
  let photos = rotate(photosFor(portfolio, page, lang), OFFSET[page] ?? 0);
  if (image) photos = [{ src: image, alt: title, category: "" }, ...photos.filter((p) => p.src !== image)];
  const words = title.split(" ");

  return (
    <section className="relative isolate overflow-hidden pt-28 sm:pt-32">
      <div aria-hidden className="absolute -left-40 top-10 -z-10 size-[34rem] rounded-full bg-gold/15 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-8 lg:min-h-[64svh] lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="pb-6 lg:pb-12">
          <nav aria-label="Breadcrumb" className="animate-fadeup font-sub text-xs text-white/50">
            <Link href="/" className="u-link hover:text-gold">{t.nav_home}</Link>
            <span className="mx-2 text-gold">/</span>
            <span className="text-white/80">{eyebrow}</span>
          </nav>
          <p className="eyebrow eyebrow-line in mt-8 animate-fadeup [animation-delay:.1s]">{eyebrow}</p>
          <h1 aria-label={title} className="mt-5 font-display text-[clamp(3.4rem,8vw,7.5rem)] uppercase leading-[0.88] tracking-wide text-white">
            {words.map((w, i) => (
              <span key={i} className="word mr-[0.18em]">
                <span className={i === words.length - 1 ? "text-gold" : ""} style={{ animationDelay: `${0.15 + i * 0.07}s` }}>{w}</span>
              </span>
            ))}
          </h1>
          {text && <p className="mt-6 max-w-lg animate-fadeup text-lg leading-relaxed text-white/65 [animation-delay:.5s]">{text}</p>}
        </div>
        <Prints photos={photos} className="mx-auto aspect-[6/5] w-full max-w-xl lg:max-w-none" />
      </div>
      <div className="mt-10 pb-4 sm:mt-14">
        <PhotoMarquee photos={rotate(photos, 3)} height="h-40 sm:h-52" speed={70} />
      </div>
    </section>
  );
}
