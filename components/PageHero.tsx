import BgVideo from "./motion/BgVideo";
import { getSettings } from "@/lib/data";
import { reelFor } from "@/lib/reels";

/** Inner-page hero with a cinematic background video. */
export default async function PageHero({ eyebrow, title, text, page }: { eyebrow: string; title: string; text?: string; page: string; image?: string | null }) {
  const reel = reelFor(page, await getSettings());
  return (
    <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden border-b border-line pb-20 pt-36 sm:min-h-[78svh] sm:pb-24">
      <BgVideo src={reel.src} srcMobile={reel.srcMobile} poster={reel.poster} className="-z-20 [&_video]:scale-105" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
        <p className="eyebrow eyebrow-line in animate-fadeup">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-display text-6xl leading-[0.9] tracking-wide text-white sm:text-7xl md:text-8xl lg:text-9xl">
          {title.split(" ").map((w, i) => (
            <span key={i} className="word mr-[0.2em]"><span style={{ animationDelay: `${0.1 + i * 0.07}s` }}>{w}</span></span>
          ))}
        </h1>
        {text && <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 animate-fadeup [animation-delay:.45s]">{text}</p>}
      </div>
      <div className="absolute bottom-6 right-4 hidden items-center gap-3 font-sub text-[0.62rem] uppercase tracking-[0.3em] text-white/40 sm:right-8 md:flex">
        <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-red-500" /></span>
        Showreel
      </div>
    </section>
  );
}
