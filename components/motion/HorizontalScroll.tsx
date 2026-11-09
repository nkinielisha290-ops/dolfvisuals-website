"use client";
import { useEffect, useRef } from "react";

/** Pins the section and converts vertical scroll into horizontal movement (lg+). Below lg it is a swipeable row. */
export default function HorizontalScroll({ children, header }: { children: React.ReactNode; header?: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current, t = track.current;
    if (!o || !t) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    let id = 0;
    const size = () => {
      if (!mq.matches) { o.style.height = ""; t.style.transform = ""; return; }
      const dist = t.scrollWidth - innerWidth;
      o.style.height = `${innerHeight + Math.max(0, dist)}px`;
      update();
    };
    const update = () => {
      if (!mq.matches) return;
      const r = o.getBoundingClientRect();
      const dist = t.scrollWidth - innerWidth;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, o.offsetHeight - innerHeight)));
      t.style.transform = `translate3d(${-dist * p}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const on = () => { cancelAnimationFrame(id); id = requestAnimationFrame(update); };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(t);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", size);
    mq.addEventListener("change", size);
    return () => { ro.disconnect(); window.removeEventListener("scroll", on); window.removeEventListener("resize", size); mq.removeEventListener("change", size); };
  }, []);

  return (
    <div ref={outer} className="relative">
      <div className="flex flex-col justify-center overflow-hidden py-20 lg:sticky lg:top-0 lg:h-screen lg:py-0">
        {header}
        <div ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 will-change-transform sm:px-8 lg:snap-none lg:overflow-visible lg:pb-0 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-[20vw]">
          {children}
        </div>
        <div className="mx-auto mt-10 hidden h-px w-full max-w-7xl bg-white/10 px-8 lg:block">
          <div ref={bar} className="h-px origin-left scale-x-0 bg-gold" />
        </div>
      </div>
    </div>
  );
}
