import Link from "next/link";
import { FileText, Phone, UserRound } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcons";
import { PageTitle, StatusPill, fmtDate, waNumber } from "@/components/admin/ui";
import { BOOKING_STATUSES } from "@/lib/admin-resources";
import { supabaseServer } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types";
import { deleteBooking } from "../../actions";
import { updateProject } from "../../crm-actions";
import { STAGES, tzs } from "@/lib/crm";

export default async function Bookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const sb = await supabaseServer();
  let q = sb.from("dv_bookings").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as Booking[];

  return (
    <>
      <PageTitle title="Bookings" text="Booking and quotation requests. Track each job from first contact to final delivery." />
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
                <span className="min-w-40 flex-1 font-medium">{b.name}
                  {b.reference && <span className="ml-2 font-mono text-xs text-ink/40">{b.reference}</span>}
                  {b.request_type === "quote" && <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800">Quote</span>}
                </span>
                <span className="text-xs text-ink/50">{STAGES.find((x) => x[0] === b.stage)?.[1]}</span>
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
                    {b.client_id && <Link className="a-btn-ghost" href={`/admin/clients/${b.client_id}`}><UserRound className="size-4" /> Client</Link>}
                    {b.client_id && <Link className="a-btn-ghost" href={`/admin/invoices/new?client=${b.client_id}&booking=${b.id}`}><FileText className="size-4" /> Invoice</Link>}
                  </div>
                  <form action={updateProject.bind(null, b.id)} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">Status
                      <select name="status" defaultValue={b.status} className="a-input mt-1 capitalize">
                        {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm">Project stage
                      <select name="stage" defaultValue={b.stage} className="a-input mt-1">
                        {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm">Agreed price (TSh)
                      <input name="quoted_amount" inputMode="numeric" defaultValue={b.quoted_amount ?? ""} placeholder={b.quoted_amount ? tzs(b.quoted_amount) : ""} className="a-input mt-1" />
                    </label>
                    <label className="block text-sm">Delivery link (Drive / gallery)
                      <input name="deliverables_url" type="url" defaultValue={b.deliverables_url ?? ""} className="a-input mt-1" />
                    </label>
                    <label className="block text-sm sm:col-span-2">Notes
                      <textarea name="admin_notes" defaultValue={b.admin_notes ?? ""} rows={3} className="a-input mt-1" />
                    </label>
                    <div className="flex items-center justify-between sm:col-span-2">
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
