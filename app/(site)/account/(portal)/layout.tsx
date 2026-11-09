import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { signOutClient } from "@/app/account-actions";
import NotConfigured from "@/components/account/NotConfigured";
import PortalNav from "@/components/account/PortalNav";
import { SocialIcon } from "@/components/SocialIcons";
import { getPortal } from "@/lib/account";
import { getSettings } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";
import { hasSupabase } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const a = getAcc(lang);
  const settings = await getSettings();
  if (!hasSupabase) {
    return <section className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-8"><NotConfigured a={a} whatsapp={settings.whatsapp} bookLabel={getDict(lang).nav_book} /></section>;
  }
  const { client, totals, invoices, paidFor } = await getPortal();

  const signOut = (
    <form action={signOutClient}>
      <button type="submit" className="btn-ghost !px-5 !py-2.5 !text-[0.8rem]"><LogOut className="size-4" /> {a.sign_out}</button>
    </form>
  );

  if (!client) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-8">
        <div className="border border-gold/30 bg-ink-2 p-8">
          <h1 className="font-heading text-2xl font-bold">{a.setup_title}</h1>
          <p className="mt-3 text-white/60">{a.setup_text}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer" className="btn-gold"><SocialIcon name="whatsapp" className="size-4" /> {a.whatsapp}</a>
            {signOut}
          </div>
        </div>
      </section>
    );
  }

  const unpaid = invoices.filter((i) => Number(i.total) - paidFor(i.id) > 0).length;
  const nav = [
    { key: "overview" as const, href: "/account", label: a.nav_overview },
    { key: "bookings" as const, href: "/account/bookings", label: a.nav_bookings, badge: totals.active },
    { key: "billing" as const, href: "/account/billing", label: a.nav_billing, badge: unpaid },
    { key: "settings" as const, href: "/account/settings", label: a.nav_settings },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px)] [background-size:calc(100%/6)_100%]" />
      <header className="flex flex-wrap items-end justify-between gap-6 pb-6 lg:pb-10">
        <div>
          <p className="eyebrow eyebrow-line in">{a.account}</p>
          <p className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] uppercase leading-[0.9] tracking-wide">
            {a.hello}, <span className="text-gold">{client.name.split(" ")[0]}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/booking" className="btn-gold !px-5 !py-2.5 !text-[0.8rem]"><Plus className="size-4" /> {a.book_new}</Link>
          {signOut}
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside><PortalNav items={nav} /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
