import { SocialIcon } from "@/components/SocialIcons";
import { PageTitle, StatusPill, fmtDate, waNumber } from "@/components/admin/ui";
import { INQUIRY_STATUSES } from "@/lib/admin-resources";
import { supabaseServer } from "@/lib/supabase/server";
import type { Inquiry } from "@/lib/types";
import { deleteInquiry, updateInquiry } from "../../actions";

export default async function Inquiries() {
  const sb = await supabaseServer();
  const { data } = await sb.from("dv_inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Inquiry[];
  return (
    <>
      <PageTitle title="Messages" text="Messages sent from the Contact page." />
      {rows.length === 0 ? <p className="rounded-xl border border-dashed border-ink/20 p-10 text-center text-ink/50">No messages yet.</p> : (
        <div className="space-y-3">
          {rows.map((m) => (
            <article key={m.id} className="rounded-xl border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <h2 className="flex-1 font-medium">{m.name}{m.subject && <span className="text-ink/50"> — {m.subject}</span>}</h2>
                <span className="text-xs text-ink/40">{fmtDate(m.created_at, true)}</span>
                <StatusPill s={m.status} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">{m.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {m.phone && <a className="a-btn-ghost" href={`https://wa.me/${waNumber(m.phone)}`} target="_blank" rel="noopener noreferrer"><SocialIcon name="whatsapp" className="size-4 text-[#25D366]" /> {m.phone}</a>}
                {m.email && <a className="a-btn-ghost" href={`mailto:${m.email}`}>{m.email}</a>}
                <span className="flex-1" />
                {INQUIRY_STATUSES.filter((s) => s !== m.status).map((s) => (
                  <form key={s} action={updateInquiry.bind(null, m.id, s)}><button className="a-btn-ghost capitalize">Mark {s}</button></form>
                ))}
                <form action={deleteInquiry.bind(null, m.id)}><button className="px-2 text-xs text-red-600 hover:underline">Delete</button></form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
