import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import InvoiceEditor from "@/components/admin/InvoiceEditor";
import PaymentForm from "@/components/admin/PaymentForm";
import { SocialIcon } from "@/components/SocialIcons";
import { PageTitle, StatusPill, waNumber } from "@/components/admin/ui";
import { tzs } from "@/lib/crm";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking, Client, Invoice, InvoiceItem } from "@/lib/types";
import { deleteInvoice, saveInvoice } from "../../../crm-actions";

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ client?: string; booking?: string }> }) {
  const { id } = await params;
  const { client: qClient, booking: qBooking } = await searchParams;
  const sb = await supabaseServer();
  const [{ data: clients }, { data: bookings }, inv, { data: pays }] = await Promise.all([
    sb.from("dv_clients").select("id,name,phone").order("name"),
    sb.from("dv_bookings").select("id,client_id,service_slug,event_date,reference,quoted_amount").order("created_at", { ascending: false }).limit(300),
    id === "new" ? Promise.resolve({ data: null }) : sb.from("dv_invoices").select("*").eq("id", id).maybeSingle(),
    id === "new" ? Promise.resolve({ data: [] }) : sb.from("dv_payments").select("amount").eq("invoice_id", id),
  ]);
  const invoice = inv.data as Invoice | null;
  if (id !== "new" && !invoice) notFound();

  // pre-fill an invoice line from the booking
  let defaultsItems: InvoiceItem[] | undefined;
  if (!invoice && qBooking) {
    const b = (bookings as Partial<Booking>[] | null)?.find((x) => x.id === qBooking);
    if (b) defaultsItems = [{ description: `${b.service_slug ?? "Photography / videography"}${b.event_date ? ` — ${b.event_date}` : ""}${b.reference ? ` (${b.reference})` : ""}`, qty: 1, price: Number(b.quoted_amount ?? 0) }];
  }
  const clientOpts = (clients ?? []).map((c) => ({ id: c.id, label: `${c.name}${c.phone ? ` · ${c.phone}` : ""}` }));
  const bookingOpts = (bookings ?? []).map((b) => ({ id: b.id, client_id: b.client_id, label: `${b.reference ?? "Booking"} · ${b.service_slug ?? ""} · ${b.event_date ?? ""}` }));
  const paid = (pays ?? []).reduce((a: number, p: { amount: number }) => a + Number(p.amount), 0);
  const client = invoice ? (clients as Client[] | null)?.find((c) => c.id === invoice.client_id) : null;

  return (
    <>
      <Link href="/admin/invoices" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink"><ArrowLeft className="size-4" /> Invoices</Link>
      <PageTitle title={invoice ? `Invoice ${invoice.number}` : "New invoice"}
        text={invoice ? `${client?.name ?? ""} · Total ${tzs(invoice.total)} · Paid ${tzs(paid)} · Balance ${tzs(Math.max(0, invoice.total - paid))}` : "Create a quotation or invoice. Totals are calculated automatically."}
        action={invoice && (
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill s={invoice.status} />
            <a href={`/admin/invoice/${invoice.id}`} target="_blank" className="a-btn"><Printer className="size-4" /> Print / Save PDF</a>
            {client?.phone && (
              <a className="a-btn-ghost" target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/${waNumber(client.phone)}?text=${encodeURIComponent(`Habari ${client.name}, hii ni invoice yako ${invoice.number} kutoka DOLF VISUALS. Jumla: ${tzs(invoice.total)}. Asante!`)}`}>
                <SocialIcon name="whatsapp" className="size-4 text-[#25D366]" /> Send on WhatsApp
              </a>
            )}
          </div>
        )} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <InvoiceEditor invoice={invoice} clients={clientOpts} bookings={bookingOpts}
          defaults={{ client_id: qClient, booking_id: qBooking, items: defaultsItems }} action={saveInvoice.bind(null, id)} />
        {invoice && (
          <div className="space-y-4">
            <PaymentForm fixedClient={invoice.client_id ?? undefined}
              invoices={[{ id: invoice.id, label: `${invoice.number} · ${tzs(invoice.total)}`, client_id: invoice.client_id, balance: invoice.total - paid }]} />
            <form action={deleteInvoice.bind(null, invoice.id)}><button className="text-xs text-red-600 hover:underline">Delete invoice</button></form>
          </div>
        )}
      </div>
    </>
  );
}
