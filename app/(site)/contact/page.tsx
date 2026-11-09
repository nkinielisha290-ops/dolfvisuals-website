import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/Forms";
import PageHero from "@/components/PageHero";
import { SocialIcon, SocialLinks } from "@/components/SocialIcons";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getSettings, waLink } from "@/lib/data";

export const metadata: Metadata = { title: "Contact Us", description: "Contact DOLF VISUALS in Dar es Salaam — phone, WhatsApp and email." };

export default async function Contact() {
  const lang = await getLang();
  const t = getDict(lang);
  const s = await getSettings();
  return (
    <>
      <PageHero page="contact" eyebrow={t.contact_eyebrow} title={t.contact_title} text={t.contact_text} />
      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-10">
          {[
            { icon: Phone, label: t.phone, value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
            { icon: Mail, label: t.email, value: s.email, href: `mailto:${s.email}` },
            { icon: MapPin, label: t.location, value: tr(s, "location", lang) },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="reveal flex gap-5">
              <span className="grid size-12 shrink-0 place-items-center border border-gold/40 text-gold"><Icon className="size-5" /></span>
              <div>
                <p className="label">{label}</p>
                {href ? <a href={href} className="mt-1 block break-all font-heading text-lg hover:text-gold">{value}</a> : <p className="mt-1 font-heading text-lg">{value}</p>}
              </div>
            </div>
          ))}
          <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="reveal inline-flex items-center gap-3 bg-[#25D366] px-6 py-4 font-sub text-sm font-semibold text-white">
            <SocialIcon name="whatsapp" className="size-5" /> {t.whatsapp_us}
          </a>
          <div className="reveal">
            <SocialLinks settings={s} />
          </div>
        </div>
        <div className="reveal"><ContactForm t={t} whatsapp={s.whatsapp} /></div>
      </section>
      <section className="h-80 w-full border-t border-line map-frame">
        <iframe title="Dar es Salaam" className="size-full" loading="lazy" src="https://www.google.com/maps?q=Dar%20es%20Salaam%2C%20Tanzania&z=12&output=embed" />
      </section>
    </>
  );
}
