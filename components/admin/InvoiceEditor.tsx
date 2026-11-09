"use client";
import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { INVOICE_STATUSES, invoiceTotals, label, tzs } from "@/lib/crm";
import type { Invoice, InvoiceItem } from "@/lib/types";

type Opt = { id: string; label: string; client_id?: string | null };

export default function InvoiceEditor({ invoice, clients, bookings, defaults, action }: {
  invoice: Invoice | null; clients: Opt[]; bookings: Opt[];
  defaults: { client_id?: string; booking_id?: string; items?: InvoiceItem[] };
  action: (p: string | null, fd: FormData) => Promise<string | null>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items?.length ? invoice.items : defaults.items ?? [{ description: "", qty: 1, price: 0 }]);
  const [discount, setDiscount] = useState(Number(invoice?.discount ?? 0));
  const [tax, setTax] = useState(Number(invoice?.tax_rate ?? 0));
  const [client, setClient] = useState(invoice?.client_id ?? defaults.client_id ?? "");
  const totals = useMemo(() => invoiceTotals({ items, discount, tax_rate: tax }), [items, discount, tax]);
  const set = (i: number, k: keyof InvoiceItem, v: string) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, [k]: k === "description" ? v : Number(v.replace(/[^\d.]/g, "")) || 0 } : x)));
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="grid gap-4 rounded-xl border border-ink/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium sm:col-span-2">Client *
          <select name="client_id" required value={client} onChange={(e) => setClient(e.target.value)} className="a-input mt-1">
            <option value="">Choose client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">Booking / project (optional)
          <select name="booking_id" defaultValue={invoice?.booking_id ?? defaults.booking_id ?? ""} className="a-input mt-1">
            <option value="">—</option>
            {bookings.filter((b) => !client || b.client_id === client).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Issue date<input type="date" name="issue_date" defaultValue={invoice?.issue_date ?? today} className="a-input mt-1" /></label>
        <label className="text-sm font-medium">Due date<input type="date" name="due_date" defaultValue={invoice?.due_date ?? due} className="a-input mt-1" /></label>
        <label className="text-sm font-medium">Status
          <select name="status" defaultValue={invoice?.status ?? "draft"} className="a-input mt-1">
            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink/50">
            <tr><th className="p-3">Description</th><th className="w-20 p-3">Qty</th><th className="w-40 p-3">Unit price (TSh)</th><th className="w-36 p-3 text-right">Amount</th><th className="w-10" /></tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-ink/5">
                <td className="p-2"><input value={it.description} onChange={(e) => set(i, "description", e.target.value)} placeholder="e.g. Wedding photography — full day" className="a-input" /></td>
                <td className="p-2"><input value={it.qty || ""} onChange={(e) => set(i, "qty", e.target.value)} inputMode="numeric" className="a-input" /></td>
                <td className="p-2"><input value={it.price || ""} onChange={(e) => set(i, "price", e.target.value)} inputMode="numeric" className="a-input" /></td>
                <td className="p-3 text-right font-medium">{tzs(it.qty * it.price)}</td>
                <td className="p-2"><button type="button" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} aria-label="Remove" className="text-ink/40 hover:text-red-600"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-start justify-between gap-6 border-t border-ink/5 p-4">
          <button type="button" onClick={() => setItems((xs) => [...xs, { description: "", qty: 1, price: 0 }])} className="a-btn-ghost"><Plus className="size-4" /> Add item</button>
          <dl className="grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
            <dt className="text-ink/60">Subtotal</dt><dd className="text-right">{tzs(totals.subtotal)}</dd>
            <dt className="flex items-center text-ink/60">Discount (TSh)</dt>
            <dd><input name="discount" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} inputMode="numeric" className="a-input w-32 text-right" /></dd>
            <dt className="flex items-center text-ink/60">Tax / VAT (%)</dt>
            <dd><input name="tax_rate" value={tax || ""} onChange={(e) => setTax(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} inputMode="decimal" placeholder="0" className="a-input w-32 text-right" /></dd>
            {totals.tax > 0 && (<><dt className="text-ink/60">Tax</dt><dd className="text-right">{tzs(totals.tax)}</dd></>)}
            <dt className="border-t border-ink/10 pt-2 font-heading font-bold">Total</dt><dd className="border-t border-ink/10 pt-2 text-right font-heading font-bold">{tzs(totals.total)}</dd>
          </dl>
        </div>
      </div>

      <label className="block rounded-xl border border-ink/10 bg-white p-5 text-sm font-medium">Notes / payment instructions
        <textarea name="notes" rows={3} defaultValue={invoice?.notes ?? "Payment: M-Pesa / Bank transfer. Please quote the invoice number as reference. 50% deposit confirms your booking."} className="a-input mt-1" />
      </label>

      <div className="flex items-center gap-3">
        <button disabled={pending} className="a-btn">{pending && <Loader2 className="size-4 animate-spin" />} {invoice ? "Save invoice" : "Create invoice"}</button>
        {state === "saved" && <span className="flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 className="size-4" /> Saved</span>}
        {state && state !== "saved" && <span className="text-sm text-red-600">{state}</span>}
      </div>
    </form>
  );
}
