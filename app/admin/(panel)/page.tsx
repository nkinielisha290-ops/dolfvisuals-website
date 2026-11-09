import Link from "next/link";
import { AlertCircle, CalendarCheck, Camera, ContactRound, MessageSquare, Quote, TrendingUp, Wallet } from "lucide-react";
import { PageTitle, StatusPill, fmtDate } from "@/components/admin/ui";
import { STAGES, tzs } from "@/lib/crm";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking, Communication, Payment } from "@/lib/types";

export default async function Dashboard() {
  const sb = await supabaseServer();
  const count = (t: string, f?: [string, unknown]) => {
    let q = sb.from(t).select("id", { count: "exact", head: true });
    if (f) q = q.eq(f[0], f[1]);
    return q.then((r) => r.count ?? 0);
  };
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);

  const [newBookings, newMsgs, photos, pendingReviews, clients, upcoming, active, recentPays, invs, allPays, recentComms] = await Promise.all([
    count("dv_bookings", ["status", "new"]),
    count("dv_inquiries", ["status", "new"]),
    count("dv_portfolio_items"),
    count("dv_testimonials", ["approved", false]),
    count("dv_clients"),
    sb.from("dv_bookings").select("*").gte("event_date", today).in("status", ["confirmed", "quoted", "contacted", "new"]).order("event_date").limit(6),
    sb.from("dv_bookings").select("*").eq("status", "confirmed").neq("stage", "delivered").order("event_date").limit(8),
    sb.from("dv_payments").select("*, client:dv_clients(name)").gte("paid_on", prevMonthStart).order("paid_on", { ascending: false }),
    sb.from("dv_invoices").select("id,total,status,due_date").in("status", ["sent", "partially_paid"]),
    sb.from("dv_payments").select("invoice_id,amount"),
    sb.from("dv_communications").select("*, client:dv_clients(name)").order("at", { ascending: false }).limit(5),
  ]);

  const pays = (recentPays.data ?? []) as (Payment & { client: { name: string } | null })[];
  const revenueThis = pays.filter((p) => p.paid_on >= monthStart).reduce((a, p) => a + Number(p.amount), 0);
  const revenuePrev = pays.filter((p) => p.paid_on < monthStart).reduce((a, p) => a + Number(p.amount), 0);
  const paidFor = (id: string) => (allPays.data ?? []).filter((p) => p.invoice_id === id).reduce((a, p) => a + Number(p.amount), 0);
  const open = invs.data ?? [];
  const outstanding = open.reduce((a, i) => a + Math.max(0, Number(i.total) - paidFor(i.id)), 0);
  const overdue = open.filter((i) => i.due_date && i.due_date < today).length;
  const change = revenuePrev ? Math.round(((revenueThis - revenuePrev) / revenuePrev) * 100) : null;

  const money = [
    { label: "Revenue this month", value: tzs(revenueThis), sub: change === null ? "" : `${change >= 0 ? "+" : ""}${change}% vs last month`, href: "/admin/payments", icon: TrendingUp },
    { label: "Outstanding invoices", value: tzs(outstanding), sub: `${open.length} open${overdue ? ` · ${overdue} overdue` : ""}`, href: "/admin/invoices?status=sent", icon: Wallet, warn: overdue > 0 },
    { label: "Clients", value: String(clients), sub: "registered", href: "/admin/clients", icon: ContactRound },
  ];
  const stats = [
    { label: "New bookings", value: newBookings, href: "/admin/bookings?status=new", icon: CalendarCheck },
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
      <PageTitle title="Dashboard" text="Business activity at a glance — bookings, money, projects and conversations." />
      <div className="grid gap-4 md:grid-cols-3">
        {money.map(({ label, value, sub, href, icon: Icon, warn }) => (
          <Link key={label} href={href} className="rounded-xl bg-ink p-5 text-white transition hover:bg-ink-3">
            <Icon className="size-5 text-gold" />
            <p className="mt-4 font-heading text-2xl font-bold sm:text-3xl">{value}</p>
            <p className="text-sm text-white/60">{label}</p>
            {sub && <p className={`mt-1 flex items-center gap-1 text-xs ${warn ? "text-red-300" : "text-white/40"}`}>{warn && <AlertCircle className="size-3.5" />}{sub}</p>}
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <h2 className="font-heading font-bold">Active projects</h2>
          {(active.data ?? []).length === 0 ? <p className="mt-4 text-sm text-ink/50">No confirmed projects in progress.</p> : (
            <ul className="mt-2 divide-y divide-ink/5">
              {(active.data as Booking[]).map((b) => {
                const idx = STAGES.findIndex((s) => s[0] === b.stage);
                return (
                  <li key={b.id} className="py-3">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium">{b.name}</span><span className="text-xs text-ink/50">{STAGES[idx]?.[1]} · {fmtDate(b.event_date)}</span></div>
                    <div className="mt-2 flex gap-1">{STAGES.map((s, k) => <span key={s[0]} className={`h-1.5 flex-1 rounded-full ${k <= idx ? "bg-gold" : "bg-ink/10"}`} />)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-heading font-bold">Upcoming events</h2>
          {(upcoming.data ?? []).length === 0 ? <p className="mt-4 text-sm text-ink/50">No upcoming events yet.</p> :
            <ul className="mt-2 divide-y divide-ink/5">{(upcoming.data as Booking[]).map((b) => <Row key={b.id} b={b} />)}</ul>}
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-heading font-bold">Latest payments</h2>
          {pays.length === 0 ? <p className="mt-4 text-sm text-ink/50">No payments recorded yet.</p> : (
            <ul className="mt-2 divide-y divide-ink/5 text-sm">
              {pays.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between py-3"><span>{p.client?.name ?? "—"} <span className="text-xs text-ink/50">· {fmtDate(p.paid_on)}</span></span><span className="font-medium text-emerald-700">{tzs(p.amount)}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-heading font-bold">Recent client conversations</h2>
          {(recentComms.data ?? []).length === 0 ? <p className="mt-4 text-sm text-ink/50">Log calls and WhatsApp chats on each client's page.</p> : (
            <ul className="mt-2 divide-y divide-ink/5 text-sm">
              {(recentComms.data as (Communication & { client: { name: string } | null })[]).map((m) => (
                <li key={m.id} className="py-3"><p className="text-xs text-ink/50">{fmtDate(m.at, true)} · {m.client?.name}</p><p className="line-clamp-2">{m.summary}</p></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
