"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, LayoutDashboard, ReceiptText, ShieldCheck } from "lucide-react";

const ICONS = { overview: LayoutDashboard, bookings: CalendarRange, billing: ReceiptText, settings: ShieldCheck };

export default function PortalNav({ items }: { items: { key: keyof typeof ICONS; href: string; label: string; badge?: number }[] }) {
  const path = usePathname();
  const active = (href: string) => (href === "/account" ? path === "/account" : path.startsWith(href));
  return (
    <nav aria-label="Account" className="sticky top-[4.5rem] z-30 -mx-4 border-b border-line bg-ink/90 px-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:top-28 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:py-0">
        {items.map(({ key, href, label, badge }, i) => {
          const Icon = ICONS[key];
          const on = active(href);
          return (
            <li key={href} className="shrink-0">
              <Link href={href} aria-current={on ? "page" : undefined}
                className={`group relative flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 font-sub text-sm transition lg:rounded-2xl lg:px-4 lg:py-3.5 ${on ? "bg-gold text-on-gold lg:bg-ink-2 lg:text-gold" : "text-white/60 hover:text-white"}`}>
                <span className="hidden font-display text-lg tracking-wider text-white/25 transition group-hover:text-gold lg:inline">{String(i + 1).padStart(2, "0")}</span>
                <Icon className="size-4 shrink-0" />
                {label}
                {!!badge && <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-bold ${on ? "bg-on-gold/15 lg:bg-gold lg:text-on-gold" : "bg-gold text-on-gold"}`}>{badge}</span>}
                {on && <span aria-hidden className="absolute -left-4 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-full bg-gold lg:block" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
