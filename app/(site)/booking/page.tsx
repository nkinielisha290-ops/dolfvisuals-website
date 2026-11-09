import type { Metadata } from "next";
import { BookingForm } from "@/components/Forms";
import PageHero from "@/components/PageHero";
import { SocialIcon } from "@/components/SocialIcons";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getServices, getSettings, waLink } from "@/lib/data";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

/** Pre-fill the form for signed-in clients. */
async function signedInContact() {
  if (!hasSupabase) return undefined;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return undefined;
  const { data } = await sb.from("dv_clients").select("name, phone, email").maybeSingle();
  return data ? { name: data.name ?? undefined, phone: data.phone ?? undefined, email: data.email ?? undefined } : undefined;
}

export const metadata: Metadata = { title: "Book a Session", description: "Book DOLF VISUALS for your wedding, graduation, event or brand shoot." };

export default async function Booking({ searchParams }: { searchParams: Promise<{ service?: string; type?: string }> }) {
  const { service, type } = await searchParams;
  const lang = await getLang();
  const t = getDict(lang);
  const [services, s, contact] = await Promise.all([getServices(), getSettings(), signedInContact()]);
  return (
    <>
      <PageHero page="booking" eyebrow={t.book_eyebrow} title={t.book_title} text={t.book_text} />
      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.6fr_1fr]">
        <div className="reveal">
          <BookingForm t={t} whatsapp={s.whatsapp} defaultService={service} defaultKind={type === "quote" ? "quote" : "booking"} contact={contact}
            services={services.map((x) => ({ slug: x.slug, title: tr(x, "title", lang) }))} />
        </div>
        <aside className="reveal h-fit border border-line p-8 lg:sticky lg:top-28">
          <p className="eyebrow">{t.process_eyebrow}</p>
          <ol className="mt-6 space-y-6">
            {t.process.map(([h, p], i) => (
              <li key={h} className="flex gap-4">
                <span className="font-display text-2xl text-gold">{i + 1}</span>
                <div><p className="font-heading font-bold">{h}</p><p className="mt-1 text-sm text-white/50">{p}</p></div>
              </li>
            ))}
          </ol>
          <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center gap-3 border-t border-line pt-6 font-sub text-sm text-white/70 hover:text-gold">
            <SocialIcon name="whatsapp" className="size-5 text-[#25D366]" /> {t.whatsapp_us}: {s.phone}
          </a>
        </aside>
      </section>
    </>
  );
}
