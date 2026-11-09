import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import BgVideo from "@/components/motion/BgVideo";
import Viewfinder from "@/components/motion/Viewfinder";
import { getSettings } from "@/lib/data";
import type { AccDict } from "@/lib/i18n-account";
import { reelFor } from "@/lib/reels";

/**
 * Sign-in / sign-up frame. Left: the showreel running inside a camera viewfinder.
 * Right: the form printed on a "studio pass" ticket with notches and a perforation line.
 */
export default async function AuthShell({ a, tab, title, text, reel = "studio", children }: {
  a: AccDict; tab?: "signin" | "register"; title: string; text: string; reel?: string; children: React.ReactNode;
}) {
  const settings = await getSettings();
  const r = reelFor(reel, settings);

  return (
    <section className="relative isolate mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px)] [background-size:calc(100%/6)_100%]" />

      {/* viewfinder */}
      <div className="theme-dark relative hidden animate-fadeup lg:block">
        <div className="relative aspect-[4/5] max-h-[78svh] w-full overflow-hidden bg-black">
          <BgVideo src={r.srcMobile ?? r.src} poster={r.posterMobile ?? r.poster} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
          <Viewfinder label={a.pass_label} />
          <div className="absolute inset-x-0 bottom-0 z-10 p-10 pb-20">
            <p className="font-display text-5xl uppercase leading-[0.9] tracking-wide text-white">Turning moments<br /><span className="text-gold">into art</span></p>
            <ul className="mt-6 space-y-2.5">
              {a.perks.map((p, i) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/85 animate-fadeup" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold text-[#111]"><Check className="size-3" strokeWidth={3} /></span>{p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <span aria-hidden className="absolute -left-3 -top-3 h-24 w-24 border-l border-t border-gold/60" />
        <span aria-hidden className="absolute -bottom-3 -right-3 h-24 w-24 border-b border-r border-gold/60" />
      </div>

      {/* the pass */}
      <div className="mx-auto w-full max-w-[540px] animate-fadeup [animation-delay:.1s]">
        <div className="pass-notch relative bg-ink-2 shadow-2xl shadow-black/30 ring-1 ring-line" style={{ ["--notch-y" as string]: tab ? "132px" : "92px" }}>
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-[#f3dc8a] to-gold" />
          {/* header stub */}
          <div className={`flex flex-col justify-center px-7 sm:px-9 ${tab ? "h-[132px]" : "h-[92px]"}`}>
            <div className="flex items-center justify-between gap-4">
              <Link href="/" aria-label="DOLF VISUALS" className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-white.svg" alt="DOLF VISUALS" className="show-dark h-7 w-auto" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-black.svg" alt="" aria-hidden className="show-light h-7 w-auto" />
              </Link>
              <span className="font-sub text-[0.6rem] uppercase tracking-[0.35em] text-gold">{a.pass_label}</span>
            </div>
            {tab && (
              <div className="mt-5 grid grid-cols-2 rounded-full border border-line p-1 font-sub text-xs uppercase tracking-[0.15em]" role="tablist">
                <Link href="/account/login" role="tab" aria-selected={tab === "signin"}
                  className={`rounded-full py-2.5 text-center transition ${tab === "signin" ? "bg-gold text-on-gold" : "text-white/60 hover:text-white"}`}>{a.tab_signin}</Link>
                <Link href="/account/register" role="tab" aria-selected={tab === "register"}
                  className={`rounded-full py-2.5 text-center transition ${tab === "register" ? "bg-gold text-on-gold" : "text-white/60 hover:text-white"}`}>{a.tab_register}</Link>
              </div>
            )}
          </div>
          <div aria-hidden className="perforation mx-5" />
          {/* body */}
          <div className="px-7 pb-8 pt-8 sm:px-9 sm:pb-10">
            <h1 className="font-display text-[clamp(2.6rem,5vw,3.8rem)] uppercase leading-[0.9] tracking-wide">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>
            <div className="mt-8">{children}</div>
          </div>
          <div aria-hidden className="perforation mx-5" />
          <p className="flex items-center justify-center gap-2 px-6 py-4 text-center text-[0.7rem] text-white/45">
            <ShieldCheck className="size-4 shrink-0 text-gold" /> {a.secured_by}
          </p>
        </div>
      </div>
    </section>
  );
}
