import type { Metadata } from "next";
import Link from "next/link";
import BookingFrame from "@/components/account/BookingFrame";
import { getPortal } from "@/lib/account";
import { getServices } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "My bookings", robots: { index: false } };

export default async function Bookings() {
  const lang = await getLang();
  const a = getAcc(lang);
  const [{ bookings }, services] = await Promise.all([getPortal(), getServices()]);
  const serviceName = (slug: string | null) => { const s = services.find((x) => x.slug === slug); return s ? tr(s, "title", lang) : slug ?? "—"; };
  return (
    <section>
      <h1 className="font-heading text-3xl font-bold">{a.bookings}</h1>
      <p className="mt-2 font-sub text-xs uppercase tracking-[0.2em] text-white/45">{a.stage_steps}</p>
      {bookings.length === 0 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-dashed border-line p-8">
          <p className="text-white/60">{a.no_bookings}</p>
          <Link href="/booking" className="btn-gold">{a.book_new}</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {bookings.map((b, i) => <BookingFrame key={b.id} b={b} n={bookings.length - i} a={a} service={serviceName(b.service_slug)} lang={lang} image={services.find((x) => x.slug === b.service_slug)?.cover_url} />)}
        </div>
      )}
    </section>
  );
}
