import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { AccDict } from "@/lib/i18n-account";

/** Deterministic barcode from the client id. */
function Barcode({ seed }: { seed: string }) {
  const bars = seed.replace(/-/g, "").split("").flatMap((c, i) => {
    const n = parseInt(c, 16) || 0;
    return [{ w: 1 + (n % 3), gap: 1 + ((n >> 2) % 2), k: i }];
  });
  return (
    <div aria-hidden className="flex h-10 items-stretch">
      {bars.map((b) => <span key={b.k} className="bg-[#111]" style={{ width: b.w, marginRight: b.gap }} />)}
    </div>
  );
}

export default function StudioPass({ a, name, number, since, id, twoStep, bookings }: {
  a: AccDict; name: string; number: string; since: string; id: string; twoStep: boolean; bookings: number;
}) {
  const initials = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <div className="studio-pass holo relative flex min-h-[230px] overflow-hidden rounded-[22px] animate-fadeup">
      <div aria-hidden className="pass-grain pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply" />
      {/* main */}
      <div className="relative flex flex-1 flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-black.svg" alt="DOLF VISUALS" className="h-6 w-auto sm:h-7" />
          <span className="font-sub text-[0.6rem] font-semibold uppercase tracking-[0.35em]">{a.pass_label}</span>
        </div>
        <div className="mt-6 flex items-end gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#111] font-display text-2xl tracking-wider text-[#d4af37] ring-4 ring-[#111]/10 sm:size-20 sm:text-3xl">{initials}</span>
          <div className="min-w-0">
            <p className="truncate font-display text-[clamp(2.2rem,5vw,3.6rem)] uppercase leading-[0.85] tracking-wide">{name}</p>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-sub text-[0.7rem] uppercase tracking-[0.2em] text-[#111]/70">
              <span>{a.pass_no} <b className="text-[#111]">{number}</b></span>
              <span>{a.member_since} <b className="text-[#111]">{since}</b></span>
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <Barcode seed={id} />
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sub text-[0.65rem] font-semibold uppercase tracking-wider ${twoStep ? "bg-[#111] text-[#d4af37]" : "bg-[#111]/10 text-[#111]"}`}>
            {twoStep ? <ShieldCheck className="size-3.5" /> : <ShieldAlert className="size-3.5" />}{a.twofa}: {twoStep ? a.twofa_on : a.twofa_off}
          </span>
        </div>
      </div>
      {/* stub */}
      <div aria-hidden className="relative hidden w-36 flex-col items-center justify-center border-l-2 border-dashed border-[#111]/25 sm:flex">
        <span className="absolute -left-[13px] -top-3 size-6 rounded-full bg-ink" />
        <span className="absolute -bottom-3 -left-[13px] size-6 rounded-full bg-ink" />
        <p className="font-display text-6xl leading-none">{String(bookings).padStart(2, "0")}</p>
        <p className="mt-1 font-sub text-[0.6rem] uppercase tracking-[0.3em]">{a.stat_bookings}</p>
        <p className="mt-6 rotate-0 font-display text-sm tracking-[0.4em] text-[#111]/60">ADMIT ONE</p>
      </div>
    </div>
  );
}
