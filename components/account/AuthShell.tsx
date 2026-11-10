import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import Image from "next/image";
import PhotoColumns from "@/components/gallery/PhotoColumns";
import { getPortfolio } from "@/lib/data";
import type { AccDict } from "@/lib/i18n-account";
import { photosFor, rotate } from "@/lib/photos";

/**
 * Sign-in / sign-up frame. Left: a wall of DOLF VISUALS photos.
 * Right: the form printed on a "studio pass" ticket with notches and a perforation line.
 */
export default async function AuthShell({ a, tab, title, text, offset = 0, children }: {
  a: AccDict; tab?: "signin" | "register"; title: string; text: string; offset?: number; children: React.ReactNode;
}) {
  const photos = rotate(photosFor(await getPortfolio(), "account"), offset);

  return (
    <section className="relative isolate mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px)] [background-size:calc(100%/6)_100%]" />

      {/* photo wall */}
      <div className="relative hidden h-[82svh] animate-fadeup lg:block">
        <div className="h-full overflow-hidden rounded-[2rem] [mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)]">
          <PhotoColumns photos={photos} cols={2} className="h-full" speed={50} />
        </div>
        <div className="absolute -bottom-2 left-6 right-6 rounded-[1.5rem] bg-[#fff]/95 p-6 text-[#111] shadow-2xl backdrop-blur">
          <div className="flex items-center gap-4">
            {photos[0] && <span className="relative size-14 shrink-0 overflow-hidden rounded-full ring-4 ring-[#d4af37]/40"><Image src={photos[0].src} alt="" fill sizes="56px" className="object-cover object-top" /></span>}
            <p className="font-display text-3xl uppercase leading-[0.9] tracking-wide">Turning moments <span className="text-[#b8922a]">into art</span></p>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {a.perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-xs leading-snug text-black/70">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#d4af37] text-[#111]"><Check className="size-2.5" strokeWidth={3} /></span>{p}
              </li>
            ))}
          </ul>
        </div>
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
