import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ReceiptText } from "lucide-react";
import { getPortal } from "@/lib/account";
import { PAYMENT_METHODS, tzs } from "@/lib/crm";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Billing", robots: { index: false } };

export default async function Billing() {
  const lang = await getLang();
  const a = getAcc(lang);
  const { invoices, payments, paidFor } = await getPortal();
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div className="space-y-14">
      <section>
        <h1 className="font-heading text-3xl font-bold">{a.invoices}</h1>
        {invoices.length === 0 ? <p className="mt-8 border border-dashed border-line p-8 text-white/55">{a.no_invoices}</p> : (
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {invoices.map((inv) => {
              const paid = paidFor(inv.id), total = Number(inv.total), pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
              const done = inv.status === "paid" || (total > 0 && paid >= total);
              return (
                <li key={inv.id} className="reveal relative flex overflow-hidden rounded-xl bg-ink-2 ring-1 ring-line">
                  {/* stub */}
                  <div className="relative flex w-24 shrink-0 flex-col items-center justify-center gap-2 border-r-2 border-dashed border-line px-2 py-6 text-center">
                    <span className="absolute -right-[11px] -top-2.5 size-5 rounded-full bg-ink" />
                    <span className="absolute -bottom-2.5 -right-[11px] size-5 rounded-full bg-ink" />
                    <ReceiptText className="size-6 text-gold" />
                    <span className="font-sub text-[0.55rem] uppercase tracking-[0.2em] text-white/45">{a.invoice}</span>
                  </div>
                  <div className="relative min-w-0 flex-1 p-5">
                    {done && <span aria-hidden className="stamp pointer-events-none absolute right-4 top-4 px-2 py-0.5 font-display text-xl text-emerald-400">{a.paid_stamp}</span>}
                    <p className="font-display text-2xl tracking-wide">{inv.number}</p>
                    <p className="mt-1 text-xs text-white/50">{a.due}: {fmt(inv.due_date)}</p>
                    <p className="mt-4 font-display text-3xl tracking-wide text-gold">{tzs(total)}</p>
                    <div className="mt-3 h-1 bg-white/10"><div className="h-full bg-gold" style={{ width: `${pct}%` }} /></div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/55">
                      <span>{tzs(paid)} {a.paid_of} {tzs(total)}</span>
                      <Link href={`/invoice/${inv.id}`} className="flex items-center gap-1 font-semibold text-gold hover:underline">{a.view} <ArrowUpRight className="size-3.5" /></Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold">{a.payments}</h2>
        {payments.length === 0 ? <p className="mt-6 border border-dashed border-line p-6 text-white/55">{a.no_payments}</p> : (
          <ol className="relative mt-8 space-y-6 border-l border-line pl-8">
            {payments.map((p) => (
              <li key={p.id} className="relative">
                <span aria-hidden className="absolute -left-[37px] top-1.5 size-3 rounded-full bg-gold ring-4 ring-ink" />
                <p className="font-display text-2xl tracking-wide">{tzs(p.amount)}</p>
                <p className="text-sm text-white/55">{fmt(p.paid_on)} · {PAYMENT_METHODS.find((m) => m[0] === p.method)?.[1]}{p.reference ? ` · ${p.reference}` : ""}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
