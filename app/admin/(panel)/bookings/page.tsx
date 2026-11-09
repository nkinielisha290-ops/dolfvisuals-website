import Link from "next/link";
import { Phone } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcons";
import { PageTitle, StatusPill, fmtDate, waNumber } from "@/components/admin/ui";
import { BOOKING_STATUSES } from "@/lib/admin-resources";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types";
import { deleteBooking, updateBooking } from "../../actions";

export default async function Bookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const sb = await supabaseServer();
  let q = sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as Booking[];

  return (
    <>
      <PageTitle title="Bookings" text="Requests from the website booking form. Update the status as you follow up." />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {["", ...BOOKING_STATUSES].map((s) => (
          <Link key={s} href={s ? `/admin/bookings?status=${s}` : "/admin/bookings"}
            className={`rounded-full border px-3 py-1 capitalize ${status === s || (!status && !s) ? "border-ink bg-ink text-white" : "border-ink/15 bg-white"}`}>
            {s || "All"}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? <p className="rounded-xl border border-dashed border-ink/20 p-10 text-center text-ink/50">No bookings here yet.</p> : (
        <div className="space-y-3">
          {rows.map((b) => (
            <details key={b.id} className="group rounded-xl border border-ink/10 bg-white open:shadow-sm">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-1 p-4">
                <span className="min-w-40 flex-1 font-medium">{b.name}</span>
                <span className="text-sm text-ink/60">{b.service_slug ?? "—"}</span>
                <span className="text-sm text-ink/60">Event: {fmtDate(b.event_date)}</span>
                <span className="text-xs text-ink/40">Received {fmtDate(b.created_at, true)}</span>
                <StatusPill s={b.status} />
              </summary>
              <div className="grid gap-6 border-t border-ink/5 p-4 md:grid-cols-2">
                <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                  <dt className="text-ink/50">Phone</dt><dd>{b.phone}</dd>
                  <dt className="text-ink/50">Email</dt><dd>{b.email ?? "—"}</dd>
                  <dt className="text-ink/50">Location</dt><dd>{b.location ?? "—"}</dd>
                  <dt className="text-ink/50">Guests</dt><dd>{b.guests ?? "—"}</dd>
                  <dt className="text-ink/50">Budget</dt><dd>{b.budget ?? "—"}</dd>
                  <dt className="text-ink/50">Details</dt><dd className="whitespace-pre-wrap">{b.details ?? "—"}</dd>
                </dl>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <a className="a-btn-ghost" href={`https://wa.me/${waNumber(b.phone)}?text=${encodeURIComponent(`Habari ${b.name}, asante kwa kuwasiliana na DOLF VISUALS.`)}`} target="_blank" rel="noopener noreferrer">
                      <SocialIcon name="whatsapp" className="size-4 text-[#25D366]" /> WhatsApp
                    </a>
                    <a className="a-btn-ghost" href={`tel:${b.phone}`}><Phone className="size-4" /> Call</a>
                  </div>
                  <form action={updateBooking.bind(null, b.id)} className="mt-4 space-y-3">
                    <label className="block text-sm">Status
                      <select name="status" defaultValue={b.status} className="a-input mt-1 capitalize">
                        {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm">Notes (quote, payment, deliverables…)
                      <textarea name="admin_notes" defaultValue={b.admin_notes ?? ""} rows={3} className="a-input mt-1" />
                    </label>
                    <div className="flex items-center justify-between">
                      <button className="a-btn">Save</button>
                      <button formAction={deleteBooking.bind(null, b.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </div>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
