"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import LangSwitch from "./LangSwitch";
import { SocialIcon } from "./SocialIcons";
import ThemeToggle from "./ThemeToggle";
import type { Lang } from "@/lib/types";

type NavItem = { href: string; label: string };

export default function Header({ lang, nav, bookLabel, accountLabel, socials = [], themeLabels }: { lang: Lang; nav: NavItem[]; bookLabel: string; accountLabel: string; socials?: { key: string; label: string; url: string }[]; themeLabels: { light: string; dark: string } }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > 400 && y > last + 4) setHidden(true);
      else if (y < last - 4 || y <= 400) setHidden(false);
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${hidden && !open ? "-translate-y-full" : ""} ${scrolled || open ? "bg-ink/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"}`}>
      <span aria-hidden className="scroll-progress absolute inset-x-0 bottom-0 h-px origin-left bg-gold" />
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:h-20 sm:px-8">
        <Link href="/" aria-label="DOLF VISUALS — home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.svg" alt="DOLF VISUALS" className="show-dark h-8 w-auto sm:h-9" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-black.svg" alt="" aria-hidden className="show-light h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex 2xl:gap-8" aria-label="Main">
          {nav.filter((n) => n.href !== "/").map((n) => (
            <Link key={n.href} href={n.href}
              className={`u-link relative font-sub text-[0.82rem] tracking-wide transition ${active(n.href) ? "text-gold" : "text-white/75 hover:text-white"}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <LangSwitch lang={lang} className="hidden sm:flex" />
          <ThemeToggle labels={themeLabels} className="hidden sm:grid" />
          <Link href="/account" aria-label={accountLabel} title={accountLabel}
            className={`hidden size-9 place-items-center rounded-full border transition sm:grid ${path.startsWith("/account") ? "border-gold text-gold" : "border-white/20 text-white/80 hover:border-gold hover:text-gold"}`}>
            <UserRound className="size-4" />
          </Link>
          <Link href="/booking" className="btn-gold hidden !px-5 !py-2.5 !text-[0.8rem] md:inline-flex">{bookLabel}</Link>
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-white xl:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/5 bg-ink px-4 pb-10 pt-6 sm:px-8 xl:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {nav.map((n, i) => (
              <Link key={n.href} href={n.href} style={{ animationDelay: `${i * 40}ms` }}
                className={`animate-fadeup border-b border-white/5 py-4 font-display text-4xl tracking-wide ${active(n.href) ? "text-gold" : "text-white"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/account" className="mt-6 flex items-center gap-3 border border-white/10 px-4 py-3 font-sub text-sm text-white/85 hover:border-gold hover:text-gold">
            <UserRound className="size-5 text-gold" /> {accountLabel}
          </Link>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4"><LangSwitch lang={lang} /><ThemeToggle labels={themeLabels} /></div>
            <Link href="/booking" className="btn-gold">{bookLabel}</Link>
          </div>
          {socials.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-white/5 pt-6">
              {socials.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="grid size-10 place-items-center border border-white/15 text-white/75 hover:border-gold hover:text-gold">
                  <SocialIcon name={s.key} className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
