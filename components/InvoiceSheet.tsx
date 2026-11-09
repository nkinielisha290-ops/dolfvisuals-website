import { PAYMENT_METHODS, invoiceTotals, label, tzs } from "@/lib/crm";
import type { Client, Invoice, Payment, Settings } from "@/lib/types";

/** A4 invoice document — shared by the admin print view and the client portal. */
export default function InvoiceSheet({ invoice, client: c, payments: pays, settings: s }: { invoice: Invoice; client: Client | null; payments: Payment[]; settings: Settings }) {
  const t = invoiceTotals(invoice);
  const paid = pays.reduce((a, p) => a + Number(p.amount), 0);
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—");
  return (
      <article className="mx-auto max-w-[210mm] bg-white p-10 text-[13px] leading-relaxed text-[#111] shadow-xl print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-8 border-b-2 border-[#111] pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-black.svg" alt="DOLF VISUALS" className="h-12" />
          <div className="text-right">
            <p className="font-display text-5xl leading-none tracking-wide">{invoice.status === "draft" ? "QUOTATION" : "INVOICE"}</p>
            <p className="mt-2 font-semibold">{invoice.number}</p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777]">From</p>
            <p className="mt-1 font-semibold">DOLF VISUALS</p>
            <p>{s.location_en}</p><p>{s.phone}</p><p>{s.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777]">Bill to</p>
            <p className="mt-1 font-semibold">{c?.name ?? "—"}</p>
            {c?.organization && <p>{c.organization}</p>}{c?.address && <p>{c.address}</p>}{c?.phone && <p>{c.phone}</p>}{c?.email && <p>{c.email}</p>}
          </div>
          <div className="text-right">
            <p><span className="text-[#777]">Issued: </span>{fmt(invoice.issue_date)}</p>
            <p><span className="text-[#777]">Due: </span>{fmt(invoice.due_date)}</p>
            <p className="mt-2 inline-block border border-[#D4AF37] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">{label(invoice.status)}</p>
          </div>
        </section>

        <table className="mt-10 w-full">
          <thead><tr className="border-b border-[#111] text-left text-[10px] uppercase tracking-[0.18em] text-[#777]">
            <th className="py-2">Description</th><th className="w-16 py-2 text-right">Qty</th><th className="w-36 py-2 text-right">Unit price</th><th className="w-36 py-2 text-right">Amount</th></tr></thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i} className="border-b border-[#e5e5e5]"><td className="py-3">{it.description}</td><td className="py-3 text-right">{it.qty}</td><td className="py-3 text-right">{tzs(it.price)}</td><td className="py-3 text-right">{tzs(it.qty * it.price)}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <dl className="grid w-72 grid-cols-[1fr_auto] gap-x-6 gap-y-1.5">
            <dt className="text-[#777]">Subtotal</dt><dd className="text-right">{tzs(t.subtotal)}</dd>
            {t.discount > 0 && (<><dt className="text-[#777]">Discount</dt><dd className="text-right">− {tzs(t.discount)}</dd></>)}
            {t.tax > 0 && (<><dt className="text-[#777]">Tax ({invoice.tax_rate}%)</dt><dd className="text-right">{tzs(t.tax)}</dd></>)}
            <dt className="border-t-2 border-[#111] pt-2 text-base font-bold">Total</dt><dd className="border-t-2 border-[#111] pt-2 text-right text-base font-bold">{tzs(t.total)}</dd>
            {paid > 0 && (<><dt className="text-[#777]">Paid</dt><dd className="text-right">− {tzs(paid)}</dd>
              <dt className="font-semibold">Balance due</dt><dd className="text-right font-semibold">{tzs(Math.max(0, t.total - paid))}</dd></>)}
          </dl>
        </div>

        {pays.length > 0 && (
          <section className="mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777]">Payments received</p>
            <ul className="mt-2 space-y-1">
              {pays.map((p) => <li key={p.id}>{fmt(p.paid_on)} — {tzs(p.amount)} via {PAYMENT_METHODS.find((m) => m[0] === p.method)?.[1]}{p.reference ? ` (ref ${p.reference})` : ""}</li>)}
            </ul>
          </section>
        )}

        {invoice.notes && <section className="mt-8 border-l-2 border-[#D4AF37] pl-4"><p className="whitespace-pre-wrap">{invoice.notes}</p></section>}

        <footer className="mt-14 flex items-end justify-between border-t border-[#e5e5e5] pt-5 text-[11px] text-[#777]">
          <p>Thank you for choosing DOLF VISUALS.</p>
          <p className="font-display text-lg tracking-[0.15em] text-[#111]">{s.tagline_en.toUpperCase()}</p>
        </footer>
      </article>
  );
}
