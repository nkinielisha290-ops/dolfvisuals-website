import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SocialLinks } from "./SocialIcons";
import { tr, type Dict } from "@/lib/i18n";
import type { Lang, Settings } from "@/lib/types";

export default function Footer({ t, lang, settings, nav }: { t: Dict; lang: Lang; settings: Settings; nav: { href: string; label: string }[] }) {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.svg" alt="DOLF VISUALS" className="h-10 w-auto" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">{t.footer_text}</p>
          <p className="mt-6 font-display text-2xl tracking-[0.12em] text-gold">{tr(settings, "tagline", lang)}</p>
          <SocialLinks settings={settings} className="mt-6" />
        </div>
        <div>
          <p className="eyebrow">{t.footer_explore}</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href} className="text-white/60 transition hover:text-gold">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.nav_contact}</p>
          <ul className="mt-5 space-y-4 text-sm text-white/70">
            <li className="flex gap-3"><Phone className="size-4 shrink-0 text-gold" /><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-gold">{settings.phone}</a></li>
            <li className="flex gap-3"><Mail className="size-4 shrink-0 text-gold" /><a href={`mailto:${settings.email}`} className="break-all hover:text-gold">{settings.email}</a></li>
            <li className="flex gap-3"><MapPin className="size-4 shrink-0 text-gold" />{tr(settings, "location", lang)}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/35 sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} DOLF VISUALS. {t.footer_rights}</p>
          <p className="tracking-[0.25em] uppercase">Creativity. Precision. Visual Excellence.</p>
        </div>
      </div>
    </footer>
  );
}
