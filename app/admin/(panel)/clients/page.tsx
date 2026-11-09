import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageTitle, fmtDate } from "@/components/admin/ui";
import { label, tzs } from "@/lib/crm";
import { supabaseServer } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const sb = await supabaseServer();
  let cq = sb.from("dv_clients").select("*").order("created_at", { ascending: false }).limit(500);
  if (q) cq = cq.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,phone.ilike.%${q.replace(/[%,()]/g, "")}%,organization.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const [{ data: clients }, { data: invs }, { data: pays }, { data: bks }] = await Promise.all([
    cq, sb.from("dv_invoices").select("client_id,total,status"), sb.from("dv_payments").select("client_id,amount"), sb.from("dv_bookings").select("client_id"),
  ]);
  const sum = (rows: { client_id: string | null; v: number }[], id: string) => rows.filter((r) => r.client_id === id).reduce((a, r) => a + r.v, 0);
  const invoiced = (invs ?? []).filter((i) => i.status !== "cancelled" && i.status !== "draft").map((i) => ({ client_id: i.client_id, v: Number(i.total) }));
  const paid = (pays ?? []).map((p) => ({ client_id: p.client_id, v: Number(p.amount) }));

  return (
    <>
      <PageTitle title="Clients" text="Every client, their bookings, invoices, payments and conversations in one place. Website bookings are added automatically."
        action={<Link href="/admin/clients/new" className="a-btn"><Plus className="size-4" /> Register client</Link>} />
      <form className="mb-5 flex max-w-md items-center gap-2">
        <div className="relative flex-1"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" /><input name="q" defaultValue={q} placeholder="Search name, phone or organization" className="a-input !pl-8" /></div>
        <button className="a-btn-ghost">Search</button>
      </form>
      {(clients ?? []).length === 0 ? <p className="rounded-xl border border-dashed border-ink/20 p-10 text-center text-ink/50">No clients yet.</p> : (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="p-3">Client</th><th className="p-3">Phone</th><th className="p-3">Source</th><th className="p-3 text-center">Bookings</th><th className="p-3 text-right">Invoiced</th><th className="p-3 text-right">Paid</th><th className="p-3 text-right">Balance</th><th className="p-3">Since</th></tr>
            </thead>
            <tbody>
              {(clients as Client[]).map((c) => {
                const inv = sum(invoiced, c.id), pd = sum(paid, c.id), bal = inv - pd;
                return (
                  <tr key={c.id} className="border-t border-ink/5 hover:bg-cream/50">
                    <td className="p-3"><Link href={`/admin/clients/${c.id}`} className="font-medium hover:underline">{c.name}</Link>{c.organization && <p className="text-xs text-ink/50">{c.organization}</p>}</td>
                    <td className="p-3 text-ink/70">{c.phone ?? "—"}</td>
                    <td className="p-3 text-ink/70">{label(c.source)}</td>
                    <td className="p-3 text-center">{(bks ?? []).filter((b) => b.client_id === c.id).length}</td>
                    <td className="p-3 text-right">{tzs(inv)}</td>
                    <td className="p-3 text-right text-emerald-700">{tzs(pd)}</td>
                    <td className={`p-3 text-right font-medium ${bal > 0 ? "text-red-600" : ""}`}>{tzs(bal)}</td>
                    <td className="p-3 text-ink/50">{fmtDate(c.created_at)}</td>
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
