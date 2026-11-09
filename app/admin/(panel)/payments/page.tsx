import Link from "next/link";
import { Trash2 } from "lucide-react";
import PaymentForm from "@/components/admin/PaymentForm";
import { PageTitle, fmtDate } from "@/components/admin/ui";
import { PAYMENT_METHODS, tzs } from "@/lib/crm";
import { supabaseServer } from "@/lib/supabase/server";
import type { Payment } from "@/lib/types";
import { deletePayment } from "../../crm-actions";

export default async function Payments() {
  const sb = await supabaseServer();
  const [{ data }, { data: clients }, { data: invs }] = await Promise.all([
    sb.from("dv_payments").select("*, client:dv_clients(name), invoice:dv_invoices(number)").order("paid_on", { ascending: false }).limit(300),
    sb.from("dv_clients").select("id,name,phone").order("name"),
    sb.from("dv_invoices").select("id,number,total,client_id,status").neq("status", "cancelled").order("created_at", { ascending: false }),
  ]);
  const rows = (data ?? []) as (Payment & { client: { name: string } | null; invoice: { number: string } | null })[];
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = rows.filter((r) => r.paid_on.startsWith(month)).reduce((a, r) => a + Number(r.amount), 0);
  const byMethod = PAYMENT_METHODS.map(([k, l]) => [l, rows.filter((r) => r.method === k && r.paid_on.startsWith(month)).reduce((a, r) => a + Number(r.amount), 0)] as const).filter(([, v]) => v > 0);

  return (
    <>
      <PageTitle title="Payments" text={`${tzs(thisMonth)} received this month${byMethod.length ? " · " + byMethod.map(([l, v]) => `${l} ${tzs(v)}`).join(" · ") : ""}`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
          {rows.length === 0 ? <p className="p-10 text-center text-ink/50">No payments recorded yet.</p> : (
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink/50">
                <tr><th className="p-3">Date</th><th className="p-3">Client</th><th className="p-3">Invoice</th><th className="p-3">Method</th><th className="p-3 text-right">Amount</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-ink/5">
                    <td className="p-3 text-ink/60">{fmtDate(r.paid_on)}</td>
                    <td className="p-3">{r.client_id ? <Link href={`/admin/clients/${r.client_id}`} className="hover:underline">{r.client?.name}</Link> : "—"}</td>
                    <td className="p-3">{r.invoice_id ? <Link href={`/admin/invoices/${r.invoice_id}`} className="hover:underline">{r.invoice?.number}</Link> : "—"}</td>
                    <td className="p-3 text-ink/70">{PAYMENT_METHODS.find((m) => m[0] === r.method)?.[1]}{r.reference ? ` · ${r.reference}` : ""}</td>
                    <td className="p-3 text-right font-medium text-emerald-700">{tzs(r.amount)}</td>
                    <td className="p-3"><form action={deletePayment.bind(null, r.id)}><button aria-label="Delete" className="text-ink/30 hover:text-red-600"><Trash2 className="size-4" /></button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <PaymentForm clients={(clients ?? []).map((c) => ({ id: c.id, label: `${c.name}${c.phone ? ` · ${c.phone}` : ""}` }))}
          invoices={(invs ?? []).map((i) => ({ id: i.id, label: `${i.number} · ${tzs(i.total)}`, client_id: i.client_id }))} />
      </div>
    </>
  );
}
