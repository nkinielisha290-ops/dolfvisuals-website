"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export type Slide = { id: string; quote: string; name: string; organization: string | null; photo: string | null; rating: number | null };

/** Auto-advancing testimonial carousel with arrows, dots, keyboard and swipe. */
export default function TestimonialSlider({ slides, interval = 7000 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => go(1), interval);
    return () => clearInterval(id);
  }, [paused, n, go, interval]);

  if (!n) return null;
  const s = slides[i];
  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null; }}
      tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Testimonials">
      <figure key={s.id} className="animate-fadeup">
        <span aria-hidden className="block font-display text-[7rem] leading-[0.6] text-gold">“</span>
        <blockquote className="mt-4 max-w-4xl font-heading text-2xl font-bold leading-snug tracking-tight sm:text-3xl md:text-4xl">{s.quote}</blockquote>
        <figcaption className="mt-10 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.photo && <img src={s.photo} alt="" className="size-14 rounded-full object-cover" />}
          <div>
            <p className="font-sub font-semibold">{s.name}</p>
            {s.organization && <p className="text-sm text-white/50">{s.organization}</p>}
            {s.rating ? <div className="mt-1 flex gap-0.5 text-gold">{Array.from({ length: s.rating }).map((_, k) => <Star key={k} className="size-3.5" fill="currentColor" />)}</div> : null}
          </div>
        </figcaption>
      </figure>
      {n > 1 && (
        <div className="mt-12 flex items-center justify-between gap-6">
          <div className="flex gap-2" role="tablist">
            {slides.map((x, k) => (
              <button key={x.id} type="button" role="tab" aria-selected={k === i} aria-label={`${k + 1}`} onClick={() => setI(k)}
                className={`h-1 rounded-full transition-all duration-500 ${k === i ? "w-10 bg-gold" : "w-4 bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="grid size-12 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:bg-gold hover:text-on-gold"><ChevronLeft className="size-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="grid size-12 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:bg-gold hover:text-on-gold"><ChevronRight className="size-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
