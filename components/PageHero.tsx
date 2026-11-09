import Link from "next/link";
import BgVideo from "./motion/BgVideo";
import Viewfinder from "./motion/Viewfinder";
import { getSettings } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { reelFor } from "@/lib/reels";

/**
 * Inner-page hero: editorial title on the left, the showreel playing inside a
 * camera-viewfinder frame on the right. Follows the light / dark theme.
 */
export default async function PageHero({ eyebrow, title, text, page }: { eyebrow: string; title: string; text?: string; page: string; image?: string | null }) {
  const [settings, lang] = await Promise.all([getSettings(), getLang()]);
  const t = getDict(lang);
  const reel = reelFor(page, settings);
  const words = title.split(" ");

  return (
    <section className="relative isolate overflow-hidden border-b border-line pt-28 sm:pt-32">
      {/* faint grid lines for an editorial, studio-like backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px)] [background-size:calc(100%/6)_100%]" />

      <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-14 sm:px-8 lg:min-h-[82svh] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-16">
        <div className="lg:pb-6">
          <nav aria-label="Breadcrumb" className="animate-fadeup font-sub text-xs text-white/50">
            <Link href="/" className="u-link hover:text-gold">{t.nav_home}</Link>
            <span className="mx-2 text-gold">/</span>
            <span className="text-white/80">{eyebrow}</span>
          </nav>
          <p className="eyebrow eyebrow-line in mt-8 animate-fadeup [animation-delay:.1s]">{eyebrow}</p>
          <h1 aria-label={title} className="mt-5 font-display text-[clamp(3.6rem,9vw,8.5rem)] uppercase leading-[0.86] tracking-wide text-white">
            {words.map((w, i) => (
              <span key={i} className="word mr-[0.18em]">
                <span className={`${i === words.length - 1 ? "text-gold" : ""}`} style={{ animationDelay: `${0.15 + i * 0.07}s` }}>{w}</span>
              </span>
            ))}
          </h1>
          {text && <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65 animate-fadeup [animation-delay:.5s]">{text}</p>}
          <div className="mt-10 hidden items-center gap-3 font-sub text-[0.65rem] uppercase tracking-[0.3em] text-white/40 animate-fadeup [animation-delay:.7s] lg:flex">
            <span className="h-px w-12 bg-gold" /> {t.scroll}
          </div>
        </div>

        <div className="theme-dark relative animate-fadeup [animation-delay:.25s]">
          <div className="relative mx-auto aspect-[4/5] max-h-[64svh] w-full overflow-hidden bg-black sm:max-w-md lg:max-h-[70svh] lg:max-w-none">
            <BgVideo src={reel.srcMobile ?? reel.src} poster={reel.posterMobile ?? reel.poster} toggle
              toggleClassName="absolute bottom-14 right-1/2 z-20 translate-x-1/2 sm:bottom-16"
              labels={lang === "sw" ? { pause: "Simamisha video", play: "Cheza video" } : undefined} />
            <Viewfinder label={eyebrow} />
          </div>
          <span aria-hidden className="absolute -left-3 -top-3 hidden h-24 w-24 border-l border-t border-gold/60 lg:block" />
          <span aria-hidden className="absolute -bottom-3 -right-3 hidden h-24 w-24 border-b border-r border-gold/60 lg:block" />
        </div>
      </div>
    </section>
  );
}
