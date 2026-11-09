"use client";
import { useEffect, useState } from "react";

/** Camera-viewfinder overlay: gold corner marks, REC indicator and a running timecode. */
export default function Viewfinder({ label }: { label: string }) {
  const [tc, setTc] = useState("00:00:00:00");
  useEffect(() => {
    const t0 = performance.now(); let id = 0;
    const tick = () => {
      const ms = performance.now() - t0, f = Math.floor((ms % 1000) / (1000 / 25));
      const s = Math.floor(ms / 1000), p = (n: number) => String(n).padStart(2, "0");
      setTc(`${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f)}`);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  const corner = "absolute size-7 border-gold sm:size-9";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 font-sub text-[0.62rem] uppercase tracking-[0.25em] text-white sm:text-[0.7rem]">
      <span className={`${corner} left-4 top-4 border-l-2 border-t-2`} />
      <span className={`${corner} right-4 top-4 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-4 left-4 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-4 right-4 border-b-2 border-r-2`} />
      <span className="absolute left-8 top-8 flex items-center gap-2 sm:left-11 sm:top-10">
        <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-70" /><span className="relative inline-flex size-2.5 rounded-full bg-red-500" /></span>REC
      </span>
      <span className="absolute right-8 top-8 tabular-nums sm:right-11 sm:top-10">{tc}</span>
      <span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 opacity-60">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" /><span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
      </span>
      <span className="absolute bottom-8 left-8 sm:bottom-10 sm:left-11">{label}</span>
      <span className="absolute bottom-8 right-8 sm:bottom-10 sm:right-11">DOLF VISUALS</span>
    </div>
  );
}
