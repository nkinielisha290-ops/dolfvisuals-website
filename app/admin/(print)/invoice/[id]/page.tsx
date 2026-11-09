import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import InvoiceSheet from "@/components/InvoiceSheet";
import { seedSettings } from "@/lib/seed";
import type { Client, Invoice, Payment, Settings } from "@/lib/types";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await requireAdmin();
  const { data: inv } = await sb.from("dv_invoices").select("*").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const invoice = inv as Invoice;
  const [{ data: client }, { data: pays }, { data: set }] = await Promise.all([
    sb.from("dv_clients").select("*").eq("id", invoice.client_id ?? "").maybeSingle(),
    sb.from("dv_payments").select("*").eq("invoice_id", id).order("paid_on"),
    sb.from("dv_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  const s = { ...seedSettings, ...(set ?? {}) } as Settings;

  return (
    <div className="min-h-screen bg-[#e9e6df] py-8 print:bg-white print:py-0">
      <style>{`@page { size: A4; margin: 14mm; } @media print { .no-print { display: none !important; } }`}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end gap-2 px-4"><PrintButton /></div>
      <InvoiceSheet invoice={invoice} client={client as Client | null} payments={(pays ?? []) as Payment[]} settings={s} />
    </div>
  );
}
