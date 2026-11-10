import { ArrowUpRight, Mail, Phone } from "lucide-react";
import SectionHead from "./SectionHead";
import { SocialIcon, activeSocials, handleFrom } from "./SocialIcons";
import type { Lang, Settings } from "@/lib/types";

const copy = {
  en: { eyebrow: "Stay connected", title: "Follow our work", titleDirect: "Let's talk", text: "Behind-the-scenes, new projects and the latest sessions, every week.", textDirect: "Questions about a shoot? Reach the DOLF VISUALS team directly.", follow: "Follow", chat: "Chat with us", call: "Call us", write: "Email us" },
  sw: { eyebrow: "Tuwe pamoja", title: "Fuatilia kazi zetu", titleDirect: "Tuongee", text: "Nyuma ya pazia, miradi mipya na sessions za karibuni, kila wiki.", textDirect: "Una swali kuhusu shoot? Wasiliana na timu ya DOLF VISUALS moja kwa moja.", follow: "Fuata", chat: "Ongea nasi", call: "Tupigie", write: "Tuandikie" },
};

/** Social profiles (only the ones set in Admin → Settings) plus the direct channels. */
export default function SocialSection({ settings: s, lang }: { settings: Settings; lang: Lang }) {
  const c = copy[lang] ?? copy.en;
  const socials = activeSocials(s);
  const wa = `https://wa.me/${s.whatsapp.replace(/[^\d]/g, "")}`;
  const direct = [
    { href: wa, label: c.chat, value: "WhatsApp", icon: <SocialIcon name="whatsapp" className="size-6" />, color: "#25D366", external: true },
    { href: `tel:${s.phone.replace(/\s/g, "")}`, label: c.call, value: s.phone, icon: <Phone className="size-6" />, color: "#D4AF37" },
    { href: `mailto:${s.email}`, label: c.write, value: s.email, icon: <Mail className="size-6" />, color: "#D4AF37" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
      <SectionHead eyebrow={c.eyebrow} title={socials.length ? c.title : c.titleDirect} text={socials.length ? c.text : c.textDirect} />
      <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {socials.map(({ key, label, url, color }, i) => (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer"
            className="reveal group relative flex items-center gap-5 overflow-hidden bg-ink p-7 transition-colors duration-500 hover:bg-ink-2"
            style={{ transitionDelay: `${i * 60}ms`, ["--brand" as string]: color }}>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line text-white transition duration-500 group-hover:scale-110 group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]">
              <SocialIcon name={key} className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-bold">{label}</span>
              <span className="block truncate text-sm text-white/50">{handleFrom(url)}</span>
            </span>
            <span className="flex items-center gap-1 font-sub text-xs uppercase tracking-[0.2em] text-gold">
              {c.follow} <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </a>
        ))}
        {direct.map(({ href, label, value, icon, color, external }, i) => (
          <a key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="reveal group relative flex items-center gap-5 overflow-hidden bg-ink p-7 transition-colors duration-500 hover:bg-ink-2"
            style={{ transitionDelay: `${(socials.length + i) * 60}ms`, ["--brand" as string]: color }}>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line text-white transition duration-500 group-hover:scale-110 group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]">{icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-bold">{label}</span>
              <span className="block truncate text-sm text-white/50">{value}</span>
            </span>
            <ArrowUpRight className="size-4 text-gold transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ))}
      </div>
    </section>
  );
}
