import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import InvoiceSheet from "@/components/InvoiceSheet";
import PrintButton from "@/app/admin/(print)/invoice/[id]/PrintButton";
import { seedSettings } from "@/lib/seed";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import type { Client, Invoice, Payment, Settings } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

/** Client-facing invoice. Row Level Security limits it to the signed-in client's own, non-draft invoices. */
export default async function ClientInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabase) notFound();
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/account/login?next=/invoice/${id}`);
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
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-2 px-4">
        <Link href="/account" className="a-btn"><ArrowLeft className="size-4" /> DOLF VISUALS</Link>
        <PrintButton />
      </div>
      <InvoiceSheet invoice={invoice} client={client as Client | null} payments={(pays ?? []) as Payment[]} settings={s} />
    </div>
  );
}
