import Link from "next/link";
import { CalendarCheck, Camera, MessageSquare, Quote } from "lucide-react";
import { PageTitle, StatusPill, fmtDate } from "@/components/admin/ui";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types";

export default async function Dashboard() {
  const sb = await supabaseServer();
  const count = (t: string, f?: [string, unknown]) => {
    let q = sb.from(t).select("id", { count: "exact", head: true });
    if (f) q = q.eq(f[0], f[1]);
    return q.then((r) => r.count ?? 0);
  };
  const today = new Date().toISOString().slice(0, 10);
  const [newBookings, upcoming, newMsgs, photos, pendingReviews, recent] = await Promise.all([
    count("bookings", ["status", "new"]),
    sb.from("bookings").select("*").gte("event_date", today).in("status", ["confirmed", "quoted", "contacted", "new"]).order("event_date").limit(6),
    count("inquiries", ["status", "new"]),
    count("portfolio_items"),
    count("testimonials", ["approved", false]),
    sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(6),
  ]);
  const stats = [
    { label: "New bookings", value: newBookings, href: "/admin/bookings", icon: CalendarCheck },
    { label: "New messages", value: newMsgs, href: "/admin/inquiries", icon: MessageSquare },
    { label: "Portfolio items", value: photos, href: "/admin/portfolio", icon: Camera },
    { label: "Reviews to approve", value: pendingReviews, href: "/admin/testimonials", icon: Quote },
  ];
  const Row = ({ b }: { b: Booking }) => (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{b.name}</p>
        <p className="truncate text-xs text-ink/50">{b.service_slug ?? "—"} · {fmtDate(b.event_date)}</p>
      </div>
      <StatusPill s={b.status} />
    </li>
  );
  return (
    <>
      <PageTitle title="Dashboard" text="Overview of bookings, messages and website content." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href} className="rounded-xl border border-ink/10 bg-white p-5 transition hover:border-ink/30">
            <Icon className="size-5 text-gold" />
            <p className="mt-4 font-heading text-3xl font-bold">{value}</p>
            <p className="text-sm text-ink/60">{label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-heading font-bold">Upcoming events</h2>
          {(upcoming.data ?? []).length === 0 ? <p className="mt-4 text-sm text-ink/50">No upcoming events yet.</p> :
            <ul className="mt-2 divide-y divide-ink/5">{(upcoming.data as Booking[]).map((b) => <Row key={b.id} b={b} />)}</ul>}
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-heading font-bold">Latest booking requests</h2>
          {(recent.data ?? []).length === 0 ? <p className="mt-4 text-sm text-ink/50">No bookings yet. They will appear here when clients use the booking form.</p> :
            <ul className="mt-2 divide-y divide-ink/5">{(recent.data as Booking[]).map((b) => <Row key={b.id} b={b} />)}</ul>}
        </section>
      </div>
    </>
  );
}
