"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { CHANNELS, CLIENT_SOURCES, INVOICE_STATUSES, PAYMENT_METHODS, STAGES, invoiceTotals } from "@/lib/crm";
import { BOOKING_STATUSES } from "@/lib/admin-resources";
import type { InvoiceItem } from "@/lib/types";

const v = (fd: FormData, k: string, max = 2000) => {
  const x = String(fd.get(k) ?? "").trim();
  return x ? x.slice(0, max) : null;
};
const num = (fd: FormData, k: string) => {
  const x = v(fd, k);
  if (x === null) return null;
  const n = Number(x.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const oneOf = <T extends readonly string[]>(list: T, x: string | null, d: T[number]) => (x && (list as readonly string[]).includes(x) ? x : d);
const refresh = () => revalidatePath("/admin", "layout");

/* ---------------- Clients ---------------- */
export async function saveClient(id: string, _: string | null, fd: FormData): Promise<string | null> {
  const sb = await requireAdmin();
  const row = {
    name: v(fd, "name", 160), phone: v(fd, "phone", 40), email: v(fd, "email", 160),
    organization: v(fd, "organization", 160), address: v(fd, "address", 300),
    source: oneOf(CLIENT_SOURCES, v(fd, "source"), "other"), notes: v(fd, "notes", 4000),
  };
  if (!row.name) return "Name is required";
  if (id === "new") {
    const { data, error } = await sb.from("dv_clients").insert(row).select("id").single();
    if (error) return error.message;
    refresh();
    redirect(`/admin/clients/${data.id}`);
  }
  const { error } = await sb.from("dv_clients").update(row).eq("id", id);
  if (error) return error.message;
  refresh();
  return "saved";
}

export async function deleteClient(id: string) {
  const sb = await requireAdmin();
  await sb.from("dv_clients").delete().eq("id", id);
  refresh();
  redirect("/admin/clients");
}

/* ---------------- Communications ---------------- */
export async function addCommunication(clientId: string, fd: FormData) {
  const sb = await requireAdmin();
  const summary = v(fd, "summary", 4000);
  if (!summary) return;
  await sb.from("dv_communications").insert({
    client_id: clientId, booking_id: v(fd, "booking_id"), summary,
    channel: oneOf(CHANNELS, v(fd, "channel"), "whatsapp"),
    direction: v(fd, "direction") === "in" ? "in" : "out",
  });
  refresh();
}

export async function deleteCommunication(id: string) {
  const sb = await requireAdmin();
  await sb.from("dv_communications").delete().eq("id", id);
  refresh();
}

/* ---------------- Payments ---------------- */
async function syncInvoiceStatus(sb: Awaited<ReturnType<typeof requireAdmin>>, invoiceId: string | null) {
  if (!invoiceId) return;
  const [{ data: inv }, { data: pays }] = await Promise.all([
    sb.from("dv_invoices").select("total,status").eq("id", invoiceId).maybeSingle(),
    sb.from("dv_payments").select("amount").eq("invoice_id", invoiceId),
  ]);
  if (!inv || inv.status === "cancelled") return;
  const paid = (pays ?? []).reduce((a, p) => a + Number(p.amount), 0);
  const status = paid <= 0 ? (inv.status === "draft" ? "draft" : "sent") : paid >= Number(inv.total) ? "paid" : "partially_paid";
  if (status !== inv.status) await sb.from("dv_invoices").update({ status }).eq("id", invoiceId);
}

export async function addPayment(_: string | null, fd: FormData): Promise<string | null> {
  const sb = await requireAdmin();
  const amount = num(fd, "amount");
  const client_id = v(fd, "client_id");
  if (!client_id) return "Choose a client";
  if (!amount || amount <= 0) return "Enter the amount paid";
  const invoice_id = v(fd, "invoice_id");
  let booking_id = v(fd, "booking_id");
  if (invoice_id && !booking_id) {
    const { data } = await sb.from("dv_invoices").select("booking_id").eq("id", invoice_id).maybeSingle();
    booking_id = data?.booking_id ?? null;
  }
  const { error } = await sb.from("dv_payments").insert({
    client_id, invoice_id, booking_id, amount,
    method: oneOf(PAYMENT_METHODS.map((m) => m[0]), v(fd, "method"), "mpesa"),
    reference: v(fd, "reference", 120), paid_on: v(fd, "paid_on") ?? new Date().toISOString().slice(0, 10), notes: v(fd, "notes", 1000),
  });
  if (error) return error.message;
  await syncInvoiceStatus(sb, invoice_id);
  refresh();
  return "saved";
}

export async function deletePayment(id: string) {
  const sb = await requireAdmin();
  const { data } = await sb.from("dv_payments").select("invoice_id").eq("id", id).maybeSingle();
  await sb.from("dv_payments").delete().eq("id", id);
  await syncInvoiceStatus(sb, data?.invoice_id ?? null);
  refresh();
}

/* ---------------- Invoices ---------------- */
export async function saveInvoice(id: string, _: string | null, fd: FormData): Promise<string | null> {
  const sb = await requireAdmin();
  let items: InvoiceItem[] = [];
  try {
    items = (JSON.parse(String(fd.get("items") ?? "[]")) as InvoiceItem[])
      .map((i) => ({ description: String(i.description ?? "").slice(0, 300), qty: Number(i.qty) || 0, price: Number(i.price) || 0 }))
      .filter((i) => i.description || i.price);
  } catch { return "Invalid items"; }
  const client_id = v(fd, "client_id");
  if (!client_id) return "Choose a client";
  if (!items.length) return "Add at least one item";
  const base = { items, discount: num(fd, "discount") ?? 0, tax_rate: num(fd, "tax_rate") ?? 0 };
  const row = {
    ...base, total: invoiceTotals(base).total, client_id, booking_id: v(fd, "booking_id"),
    issue_date: v(fd, "issue_date") ?? new Date().toISOString().slice(0, 10), due_date: v(fd, "due_date"),
    status: oneOf(INVOICE_STATUSES, v(fd, "status"), "draft"), notes: v(fd, "notes", 4000),
  };
  if (id === "new") {
    const { data, error } = await sb.from("dv_invoices").insert(row).select("id").single();
    if (error) return error.message;
    if (row.booking_id) await sb.from("dv_bookings").update({ quoted_amount: row.total }).eq("id", row.booking_id).is("quoted_amount", null);
    refresh();
    redirect(`/admin/invoices/${data.id}`);
  }
  const { error } = await sb.from("dv_invoices").update(row).eq("id", id);
  if (error) return error.message;
  await syncInvoiceStatus(sb, id);
  refresh();
  return "saved";
}

export async function deleteInvoice(id: string) {
  const sb = await requireAdmin();
  await sb.from("dv_invoices").delete().eq("id", id);
  refresh();
  redirect("/admin/invoices");
}

/* ---------------- Bookings: project tracking ---------------- */
export async function updateProject(id: string, fd: FormData) {
  const sb = await requireAdmin();
  await sb.from("dv_bookings").update({
    status: oneOf(BOOKING_STATUSES, v(fd, "status"), "new"),
    stage: oneOf(STAGES.map((s) => s[0]), v(fd, "stage"), "not_started"),
    quoted_amount: num(fd, "quoted_amount"),
    deliverables_url: v(fd, "deliverables_url", 500),
    admin_notes: v(fd, "admin_notes", 4000),
  }).eq("id", id);
  refresh();
}
