import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Mail, Phone, Trash2 } from "lucide-react";
import ClientForm from "@/components/admin/ClientForm";
import PaymentForm from "@/components/admin/PaymentForm";
import { SocialIcon } from "@/components/SocialIcons";
import { PageTitle, StatusPill, fmtDate, waNumber } from "@/components/admin/ui";
import { CHANNELS, PAYMENT_METHODS, STAGES, label, tzs } from "@/lib/crm";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking, Client, Communication, Invoice, Payment } from "@/lib/types";
import { addCommunication, deleteClient, deleteCommunication, deletePayment, saveClient } from "../../../crm-actions";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return (
      <>
        <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink"><ArrowLeft className="size-4" /> Clients</Link>
        <PageTitle title="Register client" text="Add a client who contacted you by WhatsApp, phone, Instagram or in person." />
        <div className="max-w-3xl"><ClientForm client={null} action={saveClient.bind(null, "new")} /></div>
      </>
    );
  }
  const sb = await supabaseServer();
  const [{ data: client }, { data: bookings }, { data: invoices }, { data: payments }, { data: comms }] = await Promise.all([
    sb.from("dv_clients").select("*").eq("id", id).maybeSingle(),
    sb.from("dv_bookings").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    sb.from("dv_invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    sb.from("dv_payments").select("*").eq("client_id", id).order("paid_on", { ascending: false }),
    sb.from("dv_communications").select("*").eq("client_id", id).order("at", { ascending: false }),
  ]);
  if (!client) notFound();
  const c = client as Client;
  const invs = (invoices ?? []) as Invoice[], pays = (payments ?? []) as Payment[];
  const invoiced = invs.filter((i) => i.status !== "cancelled" && i.status !== "draft").reduce((a, i) => a + Number(i.total), 0);
  const paid = pays.reduce((a, p) => a + Number(p.amount), 0);
  const paidFor = (invId: string) => pays.filter((p) => p.invoice_id === invId).reduce((a, p) => a + Number(p.amount), 0);
  const method = (m: string) => PAYMENT_METHODS.find((x) => x[0] === m)?.[1] ?? m;

  return (
    <>
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink"><ArrowLeft className="size-4" /> Clients</Link>
      <PageTitle title={c.name} text={[c.organization, `Client since ${fmtDate(c.created_at)}`].filter(Boolean).join(" · ")}
        action={
          <div className="flex flex-wrap gap-2">
            {c.phone && <a className="a-btn-ghost" href={`https://wa.me/${waNumber(c.phone)}`} target="_blank" rel="noopener noreferrer"><SocialIcon name="whatsapp" className="size-4 text-[#25D366]" /> WhatsApp</a>}
            {c.phone && <a className="a-btn-ghost" href={`tel:${c.phone}`}><Phone className="size-4" /> Call</a>}
            {c.email && <a className="a-btn-ghost" href={`mailto:${c.email}`}><Mail className="size-4" /> Email</a>}
            <Link href={`/admin/invoices/new?client=${c.id}`} className="a-btn"><FileText className="size-4" /> New invoice</Link>
          </div>
        } />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[["Invoiced", tzs(invoiced), ""], ["Paid", tzs(paid), "text-emerald-700"], ["Balance due", tzs(invoiced - paid), invoiced - paid > 0 ? "text-red-600" : ""]].map(([l, v, cls]) => (
          <div key={l} className="rounded-xl border border-ink/10 bg-white p-5"><p className="text-sm text-ink/60">{l}</p><p className={`mt-1 font-heading text-2xl font-bold ${cls}`}>{v}</p></div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-heading font-bold">Bookings & projects</h2>
            {(bookings ?? []).length === 0 ? <p className="mt-3 text-sm text-ink/50">No bookings yet.</p> : (
              <ul className="mt-3 divide-y divide-ink/5">
                {(bookings as Booking[]).map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{b.service_slug ?? "Booking"} · {fmtDate(b.event_date)}</p>
                      <p className="text-xs text-ink/50">{b.reference ?? ""} {b.location ? `· ${b.location}` : ""} · Stage: {STAGES.find((s) => s[0] === b.stage)?.[1]}</p>
                    </div>
                    <div className="flex items-center gap-2"><StatusPill s={b.status} />
                      <Link href={`/admin/invoices/new?client=${c.id}&booking=${b.id}`} className="text-xs text-ink/60 hover:underline">Invoice</Link></div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-heading font-bold">Invoices</h2>
            {invs.length === 0 ? <p className="mt-3 text-sm text-ink/50">No invoices yet.</p> : (
              <ul className="mt-3 divide-y divide-ink/5">
                {invs.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <Link href={`/admin/invoices/${i.id}`} className="font-medium hover:underline">{i.number}</Link>
                    <span className="text-ink/60">{fmtDate(i.issue_date)}</span>
                    <span>{tzs(i.total)} <span className="text-xs text-ink/50">(paid {tzs(paidFor(i.id))})</span></span>
                    <StatusPill s={i.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-heading font-bold">Payments</h2>
            {pays.length === 0 ? <p className="mt-3 text-sm text-ink/50">No payments recorded.</p> : (
              <ul className="mt-3 divide-y divide-ink/5">
                {pays.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <span className="font-medium text-emerald-700">{tzs(p.amount)}</span>
                    <span className="text-ink/60">{method(p.method)}{p.reference ? ` · ${p.reference}` : ""}</span>
                    <span className="text-ink/50">{fmtDate(p.paid_on)}</span>
                    <form action={deletePayment.bind(null, p.id)}><button aria-label="Delete payment" className="text-ink/30 hover:text-red-600"><Trash2 className="size-4" /></button></form>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <PaymentForm fixedClient={c.id} invoices={invs.filter((i) => i.status !== "cancelled").map((i) => ({ id: i.id, label: `${i.number} · ${tzs(i.total)}`, client_id: i.client_id, balance: Number(i.total) - paidFor(i.id) }))} />
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-heading font-bold">Communication log</h2>
            <form action={addCommunication.bind(null, c.id)} className="mt-3 space-y-2">
              <div className="flex gap-2">
                <select name="channel" defaultValue="whatsapp" className="a-input">{CHANNELS.map((ch) => <option key={ch} value={ch}>{label(ch)}</option>)}</select>
                <select name="direction" defaultValue="out" className="a-input"><option value="out">We contacted them</option><option value="in">They contacted us</option></select>
              </div>
              <textarea name="summary" required rows={2} placeholder="e.g. Sent quotation for wedding package; client will confirm by Friday." className="a-input" />
              <button className="a-btn">Add note</button>
            </form>
            {(comms ?? []).length > 0 && (
              <ol className="mt-5 space-y-4 border-l border-ink/10 pl-4">
                {(comms as Communication[]).map((m) => (
                  <li key={m.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-gold" />
                    <p className="text-xs text-ink/50">{fmtDate(m.at, true)} · {label(m.channel)} · {m.direction === "in" ? "Incoming" : "Outgoing"}</p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.summary}</p>
                    <form action={deleteCommunication.bind(null, m.id)}><button className="text-xs text-ink/40 hover:text-red-600">Delete</button></form>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <section>
            <h2 className="mb-3 font-heading font-bold">Client details</h2>
            <ClientForm client={c} action={saveClient.bind(null, c.id)} />
            <form action={deleteClient.bind(null, c.id)} className="mt-3"><button className="text-xs text-red-600 hover:underline">Delete client and all their invoices, payments and notes</button></form>
          </section>
        </div>
      </div>
    </>
  );
}
