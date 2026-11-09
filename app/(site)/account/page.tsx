import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, Download, FileText, LogOut, MapPin, Plus, Wallet } from "lucide-react";
import { signOutClient } from "@/app/account-actions";
import { PasswordForm, ProfileForm } from "@/components/account/AuthForms";
import NotConfigured from "@/components/account/NotConfigured";
import { SocialIcon } from "@/components/SocialIcons";
import { PAYMENT_METHODS, STAGES, tzs } from "@/lib/crm";
import { getServices, getSettings } from "@/lib/data";
import { getDict, tr } from "@/lib/i18n";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking, Client, Invoice, Payment } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function Account() {
  const lang = await getLang();
  const a = getAcc(lang);
  const t = getDict(lang);
  const settings = await getSettings();

  if (!hasSupabase) {
    return <section className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-8"><NotConfigured a={a} whatsapp={settings.whatsapp} bookLabel={t.nav_book} /></section>;
  }

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/account/login");

  const { data: clientRow } = await sb.from("dv_clients").select("*").maybeSingle();
  const client = clientRow as Client | null;

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

  const [{ data: b }, { data: i }, { data: p }, services] = await Promise.all([
    sb.from("dv_bookings").select("*").order("created_at", { ascending: false }),
    sb.from("dv_invoices").select("*").order("issue_date", { ascending: false }),
    sb.from("dv_payments").select("*").order("paid_on", { ascending: false }),
    getServices(),
  ]);
  const bookings = (b ?? []) as Booking[];
  const invoices = ((i ?? []) as Invoice[]).filter((x) => x.status !== "cancelled");
  const payments = (p ?? []) as Payment[];
  const serviceName = (slug: string | null) => {
    const s = services.find((x) => x.slug === slug);
    return s ? tr(s, "title", lang) : slug ?? "—";
  };
  const paidFor = (invId: string) => payments.filter((x) => x.invoice_id === invId).reduce((sum, x) => sum + Number(x.amount), 0);
  const billed = invoices.reduce((sum, x) => sum + Number(x.total), 0);
  const paidTotal = payments.reduce((sum, x) => sum + Number(x.amount), 0);
  const balance = invoices.reduce((sum, x) => sum + Math.max(0, Number(x.total) - paidFor(x.id)), 0);
  const active = bookings.filter((x) => x.status !== "cancelled" && x.status !== "completed" && x.stage !== "delivered").length;
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
  const first = client.name.split(" ")[0];

  const stats = [
    { label: a.stat_bookings, value: String(bookings.length), icon: CalendarDays },
    { label: a.stat_active, value: String(active), icon: ArrowRight },
    { label: a.stat_paid, value: tzs(paidTotal), icon: Wallet },
    { label: a.stat_balance, value: tzs(balance), icon: FileText, gold: balance > 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-8 sm:pt-36">
      {/* greeting */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <div>
          <p className="eyebrow eyebrow-line in">{a.account}</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.9] tracking-wide">
            {a.hello}, <span className="text-gold">{first}</span>
          </h1>
          <p className="mt-3 max-w-xl text-white/60">{a.dash_text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/booking" className="btn-gold !px-5 !py-2.5 !text-[0.8rem]"><Plus className="size-4" /> {a.book_new}</Link>
          {signOut}
        </div>
      </header>

      {/* stats */}
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, gold }, k) => (
          <div key={label} className="animate-fadeup bg-ink p-6" style={{ animationDelay: `${k * 0.06}s` }}>
            <Icon className="size-5 text-gold" />
            <p className={`mt-4 font-display text-3xl tracking-wide sm:text-4xl ${gold ? "text-gold" : ""}`}>{value}</p>
            <p className="mt-1 font-sub text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
          </div>
        ))}
      </div>

      {/* bookings */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold">{a.bookings}</h2>
        {bookings.length === 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-dashed border-line p-8">
            <p className="text-white/60">{a.no_bookings}</p>
            <Link href="/booking" className="btn-gold">{a.book_new}</Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 lg:grid-cols-2">
            {bookings.map((bk) => {
              const step = STAGES.findIndex(([k]) => k === bk.stage);
              const cancelled = bk.status === "cancelled";
              return (
                <li key={bk.id} className="card-shine relative border border-line bg-ink-2 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-sub text-xs uppercase tracking-[0.2em] text-white/45">
                        {a.ref} <span className="text-gold">{bk.reference ?? "—"}</span>
                        {bk.request_type === "quote" && <span className="ml-2 border border-gold/40 px-1.5 py-0.5 text-[0.6rem] text-gold">{a.quote}</span>}
                      </p>
                      <h3 className="mt-2 font-heading text-xl font-bold">{serviceName(bk.service_slug)}</h3>
                    </div>
                    <span className={`px-2.5 py-1 font-sub text-[0.65rem] uppercase tracking-wider ${cancelled ? "bg-red-500/15 text-red-300" : "bg-gold/15 text-gold"}`}>
                      {a.statuses[bk.status] ?? bk.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                    <span className="flex items-center gap-2"><CalendarDays className="size-4 text-gold" />{fmt(bk.event_date)}</span>
                    {bk.location && <span className="flex items-center gap-2"><MapPin className="size-4 text-gold" />{bk.location}</span>}
                    {bk.quoted_amount != null && <span className="flex items-center gap-2"><Wallet className="size-4 text-gold" />{tzs(bk.quoted_amount)}</span>}
                  </div>
                  {!cancelled && (
                    <div className="mt-6">
                      <p className="label !mb-2">{a.progress}: <span className="text-white">{a.stages[bk.stage]}</span></p>
                      <ol className="grid grid-cols-6 gap-1.5" aria-label={a.progress}>
                        {STAGES.map(([k], n) => (
                          <li key={k} title={a.stages[k]} className={`h-1.5 ${n <= step ? "bg-gold" : "bg-white/10"}`} />
                        ))}
                      </ol>
                    </div>
                  )}
                  {bk.deliverables_url && (
                    <a href={bk.deliverables_url} target="_blank" rel="noopener noreferrer" className="btn-gold mt-6 !px-5 !py-2.5 !text-[0.8rem]">
                      <Download className="size-4" /> {a.download}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* invoices + payments */}
      <section className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-heading text-2xl font-bold">{a.invoices}</h2>
          {invoices.length === 0 ? <p className="mt-6 border border-dashed border-line p-6 text-white/55">{a.no_invoices}</p> : (
            <div className="mt-6 overflow-x-auto border border-line">
              <table className="w-full min-w-[520px] text-sm">
                <thead><tr className="border-b border-line text-left font-sub text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
                  <th className="p-4">#</th><th className="p-4">{a.due}</th><th className="p-4 text-right">{a.total}</th><th className="p-4">{a.status}</th><th className="p-4" /></tr></thead>
                <tbody>
                  {invoices.map((inv) => {
                    const left = Math.max(0, Number(inv.total) - paidFor(inv.id));
                    return (
                      <tr key={inv.id} className="border-b border-line last:border-0">
                        <td className="p-4 font-semibold">{inv.number}</td>
                        <td className="p-4 text-white/60">{fmt(inv.due_date)}</td>
                        <td className="p-4 text-right">{tzs(inv.total)}{left > 0 && left < Number(inv.total) && <span className="block text-xs text-gold">{a.stat_balance}: {tzs(left)}</span>}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 text-xs ${inv.status === "paid" ? "bg-emerald-500/15 text-emerald-300" : "bg-gold/15 text-gold"}`}>{a.statuses[inv.status] ?? inv.status}</span></td>
                        <td className="p-4 text-right"><Link href={`/invoice/${inv.id}`} className="u-link text-gold">{a.view}</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {billed > 0 && <p className="mt-3 text-right text-xs text-white/40">{a.total}: {tzs(billed)}</p>}
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold">{a.payments}</h2>
          {payments.length === 0 ? <p className="mt-6 border border-dashed border-line p-6 text-white/55">{a.no_payments}</p> : (
            <ul className="mt-6 divide-y divide-line border border-line">
              {payments.map((py) => (
                <li key={py.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div>
                    <p className="font-semibold">{tzs(py.amount)}</p>
                    <p className="text-xs text-white/50">{PAYMENT_METHODS.find((m) => m[0] === py.method)?.[1]}{py.reference ? ` · ${py.reference}` : ""}</p>
                  </div>
                  <span className="text-white/50">{fmt(py.paid_on)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* profile */}
      <section id="profile" className="mt-16 grid gap-10 border-t border-line pt-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-heading text-2xl font-bold">{a.profile}</h2>
          <p className="mt-2 text-sm text-white/55">{a.profile_text}</p>
          <div className="mt-6"><ProfileForm a={a} client={client} /></div>
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold">{a.change_password}</h2>
          <div className="mt-8"><PasswordForm a={a} /></div>
        </div>
      </section>
    </div>
  );
}
