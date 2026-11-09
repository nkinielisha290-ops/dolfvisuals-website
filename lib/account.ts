import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";
import type { Booking, Client, Invoice, Payment } from "./types";

/** Signed-in client + their records, loaded once per request (RLS limits everything to their own rows). */
export const getPortal = cache(async () => {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/account/login");

  let { data: client } = await sb.from("dv_clients").select("*").maybeSingle();
  if (!client) {
    // first visit after Google sign-in or email confirmation: link / create the client record
    await sb.rpc("dv_claim_account");
    ({ data: client } = await sb.from("dv_clients").select("*").maybeSingle());
  }

  const [{ data: b }, { data: i }, { data: p }, { data: factors }] = await Promise.all([
    sb.from("dv_bookings").select("*").order("created_at", { ascending: false }),
    sb.from("dv_invoices").select("*").order("issue_date", { ascending: false }),
    sb.from("dv_payments").select("*").order("paid_on", { ascending: false }),
    sb.auth.mfa.listFactors(),
  ]);
  const bookings = (b ?? []) as Booking[];
  const invoices = ((i ?? []) as Invoice[]).filter((x) => x.status !== "cancelled");
  const payments = (p ?? []) as Payment[];
  const paidFor = (invId: string) => payments.filter((x) => x.invoice_id === invId).reduce((s, x) => s + Number(x.amount), 0);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((x) => x.event_date && x.event_date >= today && x.status !== "cancelled")
    .sort((a, b2) => (a.event_date! < b2.event_date! ? -1 : 1))[0] ?? null;

  return {
    user,
    client: client as Client | null,
    bookings, invoices, payments, paidFor, upcoming,
    totals: {
      paid: payments.reduce((s, x) => s + Number(x.amount), 0),
      balance: invoices.reduce((s, x) => s + Math.max(0, Number(x.total) - paidFor(x.id)), 0),
      active: bookings.filter((x) => !["cancelled", "completed"].includes(x.status) && x.stage !== "delivered").length,
    },
    mfa: (factors?.totp ?? []).filter((f) => f.status === "verified"),
    providers: Array.from(new Set((user.identities ?? []).map((x) => x.provider))),
  };
});

export type Portal = Awaited<ReturnType<typeof getPortal>>;

/** Friendly client number derived from the record id, e.g. DV-7F3A21. */
export const clientNo = (id: string) => `DV-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
