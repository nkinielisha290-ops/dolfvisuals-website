"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award, CalendarCheck, Camera, Cog, ContactRound, FileText, FolderKanban, LayoutDashboard, Menu, MessageSquare, Quote, Tags, Users, Wallet, Wrench, X, ExternalLink,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, badge: "bookings" },
  { href: "/admin/inquiries", label: "Messages", icon: MessageSquare, badge: "inquiries" },
  { href: "/admin/clients", label: "Clients", icon: ContactRound },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/portfolio", label: "Portfolio", icon: Camera },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/packages", label: "Packages & Prices", icon: Tags },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/highlights", label: "Clients & Awards", icon: Award },
  { href: "/admin/settings", label: "Settings", icon: Cog },
] as const;

export default function AdminNav({ counts, email, signOut }: { counts: Record<string, number>; email: string; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon, ...rest }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        const badge = "badge" in rest ? counts[rest.badge] : 0;
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${active ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink"}`}>
            <Icon className="size-4" /> <span className="flex-1">{label}</span>
            {badge > 0 && <span className="rounded-full bg-gold px-2 text-xs font-semibold text-ink">{badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
  const foot = (
    <div className="space-y-2 border-t border-ink/10 pt-4 text-sm">
      <a href="/" target="_blank" className="flex items-center gap-2 text-ink/60 hover:text-ink"><ExternalLink className="size-4" /> View website</a>
      <p className="truncate text-xs text-ink/40">{email}</p>
      <form action={signOut}><button className="text-xs text-red-600 hover:underline">Sign out</button></form>
    </div>
  );
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-ink/10 bg-white p-4 lg:flex">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-black.svg" alt="DOLF VISUALS" className="mb-8 ml-2 h-8" />
          {nav}
        </div>
        {foot}
      </aside>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-white px-4 py-3 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-black.svg" alt="DOLF VISUALS" className="h-7" />
        <button onClick={() => setOpen(true)} aria-label="Menu"><Menu className="size-6" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="flex h-full w-72 flex-col justify-between bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <button onClick={() => setOpen(false)} className="mb-6 ml-auto block" aria-label="Close"><X className="size-6" /></button>
              {nav}
            </div>
            {foot}
          </div>
        </div>
      )}
    </>
  );
}
