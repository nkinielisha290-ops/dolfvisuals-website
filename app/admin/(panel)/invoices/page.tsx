import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTitle, StatusPill, fmtDate } from "@/components/admin/ui";
import { INVOICE_STATUSES, label, tzs } from "@/lib/crm";
import { supabaseServer } from "@/lib/supabase/server";
import type { Invoice } from "@/lib/types";

export default async function Invoices({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const sb = await supabaseServer();
  let q = sb.from("dv_invoices").select("*, client:dv_clients(name)").order("created_at", { ascending: false }).limit(300);
  if (status) q = q.eq("status", status);
  const [{ data }, { data: pays }] = await Promise.all([q, sb.from("dv_payments").select("invoice_id,amount")]);
  const rows = (data ?? []) as (Invoice & { client: { name: string } | null })[];
  const paidFor = (id: string) => (pays ?? []).filter((p) => p.invoice_id === id).reduce((a, p) => a + Number(p.amount), 0);
  const open = rows.filter((r) => r.status === "sent" || r.status === "partially_paid");
  const outstanding = open.reduce((a, r) => a + Number(r.total) - paidFor(r.id), 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageTitle title="Invoices" text={`${open.length} open · ${tzs(outstanding)} outstanding`}
        action={<Link href="/admin/invoices/new" className="a-btn"><Plus className="size-4" /> New invoice</Link>} />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {["", ...INVOICE_STATUSES].map((s) => (
          <Link key={s} href={s ? `/admin/invoices?status=${s}` : "/admin/invoices"}
            className={`rounded-full border px-3 py-1 ${status === s || (!status && !s) ? "border-ink bg-ink text-white" : "border-ink/15 bg-white"}`}>{s ? label(s) : "All"}</Link>
        ))}
      </div>
      {rows.length === 0 ? <p className="rounded-xl border border-dashed border-ink/20 p-10 text-center text-ink/50">No invoices yet.</p> : (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="p-3">Number</th><th className="p-3">Client</th><th className="p-3">Issued</th><th className="p-3">Due</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Balance</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const bal = Number(r.total) - paidFor(r.id);
                const overdue = r.due_date && r.due_date < today && (r.status === "sent" || r.status === "partially_paid");
                return (
                  <tr key={r.id} className="border-t border-ink/5 hover:bg-cream/50">
                    <td className="p-3"><Link href={`/admin/invoices/${r.id}`} className="font-medium hover:underline">{r.number}</Link></td>
                    <td className="p-3">{r.client?.name ?? "—"}</td>
                    <td className="p-3 text-ink/60">{fmtDate(r.issue_date)}</td>
                    <td className={`p-3 ${overdue ? "font-medium text-red-600" : "text-ink/60"}`}>{fmtDate(r.due_date)}{overdue ? " · overdue" : ""}</td>
                    <td className="p-3 text-right">{tzs(r.total)}</td>
                    <td className={`p-3 text-right ${bal > 0 && r.status !== "draft" && r.status !== "cancelled" ? "font-medium text-red-600" : "text-ink/50"}`}>{tzs(Math.max(0, bal))}</td>
                    <td className="p-3"><StatusPill s={r.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
