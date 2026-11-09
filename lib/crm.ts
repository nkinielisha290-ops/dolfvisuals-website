import type { Invoice, InvoiceItem } from "./types";

export const PAYMENT_METHODS = [
  ["mpesa", "M-Pesa"], ["tigopesa", "Mixx by Yas (Tigo Pesa)"], ["airtelmoney", "Airtel Money"], ["halopesa", "HaloPesa"],
  ["bank", "Bank transfer"], ["cash", "Cash"], ["card", "Card"], ["other", "Other"],
] as const;
export const CHANNELS = ["whatsapp", "call", "email", "meeting", "sms", "instagram", "other"] as const;
export const STAGES = [
  ["not_started", "Not started"], ["pre_production", "Pre-production"], ["shooting", "Shooting"],
  ["editing", "Editing"], ["review", "Client review"], ["delivered", "Delivered"],
] as const;
export const INVOICE_STATUSES = ["draft", "sent", "partially_paid", "paid", "cancelled"] as const;
export const CLIENT_SOURCES = ["website", "whatsapp", "instagram", "referral", "walk-in", "other"] as const;

export function invoiceTotals(inv: Pick<Invoice, "items" | "discount" | "tax_rate">) {
  const subtotal = (inv.items ?? []).reduce((a: number, i: InvoiceItem) => a + Number(i.qty || 0) * Number(i.price || 0), 0);
  const afterDiscount = Math.max(0, subtotal - Number(inv.discount || 0));
  const tax = Math.round(afterDiscount * Number(inv.tax_rate || 0)) / 100;
  return { subtotal, discount: Number(inv.discount || 0), tax, total: Math.round(afterDiscount + tax) };
}

export const tzs = (n: number | null | undefined) => `TSh ${Math.round(Number(n || 0)).toLocaleString("en-US")}`;
export const label = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
