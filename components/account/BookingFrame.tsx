import { CalendarDays, Camera, ClipboardList, Download, Eye, Inbox, MapPin, PackageCheck, Scissors, Wallet } from "lucide-react";
import { STAGES, tzs } from "@/lib/crm";
import type { AccDict } from "@/lib/i18n-account";
import type { Booking } from "@/lib/types";

const STAGE_ICONS = [Inbox, ClipboardList, Camera, Scissors, Eye, PackageCheck];

/** A booking printed as a frame on a strip of film, with the production stages underneath. */
export default function BookingFrame({ b, n, a, service, lang }: { b: Booking; n: number; a: AccDict; service: string; lang: string }) {
  const step = Math.max(0, STAGES.findIndex(([k]) => k === b.stage));
  const cancelled = b.status === "cancelled";
  const pct = (step / (STAGES.length - 1)) * 100;
  const date = b.event_date ? new Date(b.event_date).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <article className="theme-dark sprockets reveal relative overflow-hidden rounded-xl bg-[#0b0b0b] px-5 py-9 text-white ring-1 ring-white/5 sm:px-8">
      <div className="relative rounded-md bg-gradient-to-br from-[#1b1b1b] to-[#121212] p-5 ring-1 ring-white/5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3 font-sub text-[0.65rem] uppercase tracking-[0.25em] text-white/45">
          <span>{a.frame} {String(n).padStart(2, "0")} · {a.ref} <span className="text-gold">{b.reference ?? "—"}</span></span>
          <span className="flex items-center gap-2">
            {b.request_type === "quote" && <span className="border border-gold/40 px-1.5 py-0.5 text-gold">{a.quote}</span>}
            <span className={`rounded-full px-2.5 py-1 ${cancelled ? "bg-red-500/15 text-red-300" : b.stage === "delivered" ? "bg-emerald-500/15 text-emerald-300" : "bg-gold/15 text-gold"}`}>
              {a.statuses[b.status] ?? b.status}
            </span>
          </span>
        </div>
        <h3 className="mt-4 font-display text-[clamp(2rem,4vw,2.8rem)] uppercase leading-[0.9] tracking-wide">{service}</h3>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
          <span className="flex items-center gap-2"><CalendarDays className="size-4 text-gold" />{date}</span>
          {b.location && <span className="flex items-center gap-2"><MapPin className="size-4 text-gold" />{b.location}</span>}
          {b.quoted_amount != null && <span className="flex items-center gap-2"><Wallet className="size-4 text-gold" />{tzs(b.quoted_amount)}</span>}
        </div>

        {!cancelled && (
          <div className="mt-8">
            <div className="relative">
              <div aria-hidden className="stage-track absolute left-4 right-4 top-4 h-0.5 sm:left-5 sm:right-5 sm:top-5" style={{ ["--p" as string]: `${pct}%` }} />
              <ol className="relative grid grid-cols-6" aria-label={a.progress}>
                {STAGES.map(([k], i) => {
                  const Icon = STAGE_ICONS[i];
                  const done = i < step, now = i === step;
                  return (
                    <li key={k} className="flex flex-col items-center text-center" aria-current={now ? "step" : undefined}>
                      <span className={`relative grid size-8 place-items-center rounded-full transition sm:size-10 ${now ? "bg-gold text-[#111] shadow-[0_0_0_6px_rgba(212,175,55,.18)]" : done ? "bg-gold/90 text-[#111]" : "bg-[#222] text-white/35 ring-1 ring-white/10"}`}>
                        <Icon className="size-3.5 sm:size-4" />
                        {now && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-gold/30 [animation-duration:2.4s]" />}
                      </span>
                      <span className={`mt-2 text-[0.6rem] leading-tight sm:text-xs ${now ? "font-semibold text-gold" : done ? "text-white/70" : "hidden text-white/35 sm:block"}`}>{a.stages[k]}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {b.deliverables_url && (
          <a href={b.deliverables_url} target="_blank" rel="noopener noreferrer" className="btn-gold mt-8 !px-5 !py-3 !text-[0.8rem]">
            <Download className="size-4" /> {a.download}
          </a>
        )}
      </div>
    </article>
  );
}
