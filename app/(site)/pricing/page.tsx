import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getDict, tr, trList } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { formatTZS, getPackages, getServices } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Pricing & Packages", description: "Photography and videography packages and custom quotations from DOLF VISUALS." };

export default async function Pricing() {
  const lang = await getLang();
  const t = getDict(lang);
  const [packages, services] = await Promise.all([getPackages(), getServices()]);
  const general = packages.filter((p) => !p.service_slug);
  const byService = services
    .map((s) => ({ s, pkgs: packages.filter((p) => p.service_slug === s.slug) }))
    .filter((x) => x.pkgs.length);

  const Card = ({ p }: { p: (typeof packages)[number] }) => (
    <div className={`reveal relative flex flex-col border p-8 sm:p-10 ${p.featured ? "border-gold bg-ink-2" : "border-line"}`}>
      {p.featured && <span className="absolute -top-3 left-8 bg-gold px-3 py-1 font-sub text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-ink">{t.most_popular}</span>}
      <h3 className="font-display text-4xl tracking-wide">{tr(p, "name", lang)}</h3>
      {tr(p, "price_note", lang) && <p className="mt-1 text-sm text-white/50">{tr(p, "price_note", lang)}</p>}
      <p className="mt-6 font-heading text-3xl font-bold text-gold">
        {p.price ? <><span className="mr-2 font-sub text-xs font-normal uppercase tracking-widest text-white/40">{t.from}</span>{formatTZS(p.price)}</> : t.on_request}
      </p>
      <ul className="mt-8 flex-1 space-y-3 text-sm text-white/75">
        {trList(p, "features", lang).map((f) => <li key={f} className="flex gap-3"><Check className="size-4 shrink-0 text-gold" />{f}</li>)}
      </ul>
      <Link href={`/booking${p.service_slug ? `?service=${p.service_slug}` : ""}`} className={`mt-10 justify-center ${p.featured ? "btn-gold" : "btn-ghost"}`}>
        {t.request_quote} <ArrowRight className="size-4" />
      </Link>
    </div>
  );

  return (
    <>
      <PageHero eyebrow={t.pricing_eyebrow} title={t.pricing_title} text={t.pricing_text} />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 md:py-28">
        {general.length > 0 && <div className="grid gap-6 md:grid-cols-3">{general.map((p) => <Card key={p.id} p={p} />)}</div>}
        {byService.map(({ s, pkgs }) => (
          <div key={s.id} className="mt-20">
            <p className="eyebrow reveal">{tr(s, "title", lang)}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">{pkgs.map((p) => <Card key={p.id} p={p} />)}</div>
          </div>
        ))}
      </section>
    </>
  );
}
