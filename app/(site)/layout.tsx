import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Intro from "@/components/Intro";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Cursor from "@/components/motion/Cursor";
import BackToTop from "@/components/motion/BackToTop";
import { SocialIcon } from "@/components/SocialIcons";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getSettings, waLink } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = getDict(lang);
  const settings = await getSettings();
  const nav = [
    { href: "/", label: t.nav_home },
    { href: "/about", label: t.nav_about },
    { href: "/services", label: t.nav_services },
    { href: "/portfolio", label: t.nav_portfolio },
    { href: "/projects", label: t.nav_projects },
    { href: "/pricing", label: t.nav_pricing },
    { href: "/testimonials", label: t.nav_testimonials },
    { href: "/contact", label: t.nav_contact },
  ];
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dolfvisuals.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "DOLF VISUALS",
    description: "Photography, videography & creative agency",
    url: site,
    image: `${site}/brand/icon-512.png`,
    telephone: settings.phone,
    email: settings.email,
    foundingDate: settings.founded,
    address: { "@type": "PostalAddress", addressLocality: "Dar es Salaam", addressCountry: "TZ" },
    slogan: tr(settings, "tagline", "en"),
    sameAs: [settings.instagram, settings.facebook, settings.tiktok, settings.youtube, settings.linkedin].filter(Boolean),
  };

  return (
    <>
      <Intro />
      <SmoothScroll />
      <Cursor />
      <Header lang={lang} nav={nav} bookLabel={t.nav_book} />
      <main className="grain">{children}</main>
      <div aria-hidden className="overflow-hidden border-t border-line py-10">
        <div className="flex w-max animate-[marquee_60s_linear_infinite] whitespace-nowrap font-display text-[clamp(4rem,12vw,10rem)] leading-none tracking-wide">
          {[0, 1].map((k) => (
            <span key={k} className="flex items-center gap-12 pr-12">
              <span className="text-outline">DOLF VISUALS</span><span className="text-gold">✦</span>
              <span className="text-outline">{tr(settings, "tagline", lang).toUpperCase()}</span><span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>
      <Footer t={t} lang={lang} settings={settings} nav={nav} />
      <a href={waLink(settings.whatsapp, lang === "sw" ? "Habari DOLF VISUALS, naomba taarifa kuhusu huduma zenu." : "Hello DOLF VISUALS, I'd like to know more about your services.")}
        target="_blank" rel="noopener noreferrer" aria-label={t.whatsapp_us}
        className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition hover:scale-105">
        <SocialIcon name="whatsapp" className="size-7" />
      </a>
      <BackToTop label={lang === "sw" ? "Rudi juu" : "Back to top"} />
      <Reveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
