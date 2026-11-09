import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Hourglass, Phone, Wallet, Clapperboard } from "lucide-react";
import BookingFrame from "@/components/account/BookingFrame";
import StudioPass from "@/components/account/StudioPass";
import { clientNo, getPortal } from "@/lib/account";
import { tzs } from "@/lib/crm";
import { getServices } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function Overview() {
  const lang = await getLang();
  const a = getAcc(lang);
  const [{ client, bookings, upcoming, totals, mfa }, services] = await Promise.all([getPortal(), getServices()]);
  if (!client) return null;
  const serviceName = (slug: string | null) => { const s = services.find((x) => x.slug === slug); return s ? tr(s, "title", lang) : slug ?? "—"; };
  const since = new Date(client.created_at).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", { month: "short", year: "numeric" });
  const days = upcoming?.event_date ? Math.round((new Date(upcoming.event_date).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / 86_400_000) : null;

  return (
    <div className="space-y-10">
      {!client.phone && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-gold/40 bg-gold/10 px-5 py-4 animate-fadeup">
          <p className="flex items-center gap-3 text-sm"><Phone className="size-5 shrink-0 text-gold" />{a.complete_profile}</p>
          <Link href="/account/settings" className="btn-gold !px-4 !py-2 !text-xs">{a.complete_btn}</Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <StudioPass a={a} name={client.name} number={clientNo(client.id)} since={since} id={client.id} twoStep={mfa.length > 0} bookings={bookings.length} />

        {/* countdown */}
        <div className="theme-dark sprockets relative flex flex-col justify-between overflow-hidden rounded-[22px] bg-[#0b0b0b] px-7 py-10 text-white animate-fadeup [animation-delay:.1s]">
          <p className="flex items-center gap-2 font-sub text-[0.65rem] uppercase tracking-[0.3em] text-gold"><Hourglass className="size-4" />{a.next_shoot}</p>
          {upcoming ? (
            <>
              <p className="mt-4 font-display leading-none">
                {days === 0 ? <span className="text-6xl text-gold">{a.today}</span> : <><span className="text-[5.5rem] text-gold">{days}</span> <span className="text-2xl text-white/60">{a.days_to_go}</span></>}
              </p>
              <div className="mt-4">
                <p className="font-heading text-lg font-bold">{serviceName(upcoming.service_slug)}</p>
                <p className="text-sm text-white/55">{new Date(upcoming.event_date!).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", { weekday: "long", day: "numeric", month: "long" })}{upcoming.location ? ` · ${upcoming.location}` : ""}</p>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <Clapperboard className="size-10 text-white/20" />
              <p className="mt-3 text-white/55">{a.no_upcoming}</p>
              <Link href="/booking" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">{a.book_new} <ArrowRight className="size-4" /></Link>
            </div>
          )}
        </div>
      </div>

      {/* stats */}
      <dl className="grid grid-cols-3 divide-x divide-line border-y border-line">
        {[
          { k: a.stat_active, v: String(totals.active), icon: Clapperboard },
          { k: a.stat_paid, v: tzs(totals.paid), icon: Wallet },
          { k: a.stat_balance, v: tzs(totals.balance), icon: Wallet, gold: totals.balance > 0 },
        ].map(({ k, v, icon: Icon, gold }) => (
          <div key={k} className="px-3 py-6 sm:px-6">
            <dt className="flex items-center gap-2 font-sub text-[0.6rem] uppercase tracking-[0.2em] text-white/50 sm:text-xs"><Icon className="hidden size-4 text-gold sm:block" />{k}</dt>
            <dd className={`mt-2 font-display text-2xl tracking-wide sm:text-4xl ${gold ? "text-gold" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>

      {/* latest */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold">{a.latest}</h2>
          {bookings.length > 1 && <Link href="/account/bookings" className="u-link flex items-center gap-1 text-sm text-gold">{a.see_all} <ArrowRight className="size-4" /></Link>}
        </div>
        {bookings[0] ? <BookingFrame b={bookings[0]} n={bookings.length} a={a} service={serviceName(bookings[0].service_slug)} lang={lang} /> : (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-dashed border-line p-8">
            <p className="text-white/60">{a.no_bookings}</p>
            <Link href="/booking" className="btn-gold">{a.book_new}</Link>
          </div>
        )}
      </section>
    </div>
  );
}
