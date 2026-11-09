"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { addPayment } from "@/app/admin/crm-actions";
import { PAYMENT_METHODS, tzs } from "@/lib/crm";

type Opt = { id: string; label: string; client_id?: string | null; balance?: number };

export default function PaymentForm({ clients, invoices, fixedClient }: { clients?: Opt[]; invoices: Opt[]; fixedClient?: string }) {
  const [state, action, pending] = useActionState(addPayment, null);
  const [client, setClient] = useState(fixedClient ?? "");
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state === "saved") form.current?.reset(); }, [state]);
  const invs = invoices.filter((i) => !client || i.client_id === client);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form ref={form} action={action} className="grid gap-3 rounded-xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
      <p className="font-heading font-bold sm:col-span-2">Record a payment</p>
      {fixedClient ? <input type="hidden" name="client_id" value={fixedClient} /> : (
        <label className="text-sm font-medium sm:col-span-2">Client *
          <select name="client_id" required value={client} onChange={(e) => setClient(e.target.value)} className="a-input mt-1">
            <option value="">Choose client…</option>
            {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
      )}
      <label className="text-sm font-medium sm:col-span-2">Invoice (optional)
        <select name="invoice_id" className="a-input mt-1">
          <option value="">— Not linked to an invoice —</option>
          {invs.map((i) => <option key={i.id} value={i.id}>{i.label}{i.balance !== undefined ? ` · balance ${tzs(i.balance)}` : ""}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Amount (TSh) *<input name="amount" inputMode="numeric" required placeholder="500000" className="a-input mt-1" /></label>
      <label className="text-sm font-medium">Method
        <select name="method" defaultValue="mpesa" className="a-input mt-1">{PAYMENT_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Transaction ref.<input name="reference" placeholder="e.g. QFX12AB34" className="a-input mt-1" /></label>
      <label className="text-sm font-medium">Date paid<input name="paid_on" type="date" defaultValue={today} className="a-input mt-1" /></label>
      <label className="text-sm font-medium sm:col-span-2">Notes<input name="notes" className="a-input mt-1" /></label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="a-btn">{pending && <Loader2 className="size-4 animate-spin" />} Save payment</button>
        {state === "saved" && <span className="flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 className="size-4" /> Payment recorded</span>}
        {state && state !== "saved" && <span className="text-sm text-red-600">{state}</span>}
      </div>
    </form>
  );
}
