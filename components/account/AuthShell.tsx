import Link from "next/link";
import { Check } from "lucide-react";
import type { AccDict } from "@/lib/i18n-account";

/** Split-screen frame for sign-in / sign-up: brand image left, form right. */
export default function AuthShell({ a, title, text, image, children, perks = false }: {
  a: AccDict; title: string; text: string; image: string; children: React.ReactNode; perks?: boolean;
}) {
  return (
    <section className="mx-auto grid min-h-[100svh] max-w-7xl gap-0 px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-2 lg:gap-12">
      <div className="theme-dark relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 size-full animate-[kenburns_24s_ease-in-out_infinite_alternate] object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span aria-hidden className="absolute left-5 top-5 h-12 w-12 border-l-2 border-t-2 border-gold" />
        <span aria-hidden className="absolute bottom-5 right-5 h-12 w-12 border-b-2 border-r-2 border-gold" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="eyebrow">{a.login_eyebrow}</p>
          <ul className="mt-6 space-y-3">
            {a.perks.map((p, i) => (
              <li key={p} className="flex items-start gap-3 text-white/90 animate-fadeup" style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold text-on-gold"><Check className="size-3" strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center lg:py-10">
        <div className="w-full max-w-lg animate-fadeup lg:mx-auto">
          <p className="eyebrow eyebrow-line in">{a.login_eyebrow}</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.9] tracking-wide">{title}</h1>
          <p className="mt-4 text-white/60">{text}</p>
          {perks && (
            <ul className="mt-6 grid gap-2 text-sm text-white/70 sm:grid-cols-2 lg:hidden">
              {a.perks.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-gold" />{p}</li>)}
            </ul>
          )}
          <div className="mt-10">{children}</div>
          <p className="mt-10 text-center font-sub text-[0.65rem] uppercase tracking-[0.3em] text-white/30">
            <Link href="/" className="hover:text-gold">DOLF VISUALS</Link> · Turning Moments Into Art
          </p>
        </div>
      </div>
    </section>
  );
}
