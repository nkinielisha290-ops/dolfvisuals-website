"use client";
import { useEffect, useRef, useState } from "react";

/** Custom cursor for fine pointers. Elements with data-cursor="Label" enlarge it and show the label. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, id = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, select, input, textarea, label");
      setLabel(t?.dataset.cursor ?? null);
      setActive(Boolean(t));
      const card = (e.target as HTMLElement).closest<HTMLElement>(".card-shine");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      id = requestAnimationFrame(loop);
    };
    const leave = () => { if (ring.current) ring.current.style.opacity = "0"; if (dot.current) dot.current.style.opacity = "0"; };
    const enter = () => { if (ring.current) ring.current.style.opacity = "1"; if (dot.current) dot.current.style.opacity = "1"; };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-gold mix-blend-difference" />
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]">
        <div className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition-all duration-300 ease-out ${
          label ? "size-24 border-gold bg-gold text-on-gold" : active ? "size-14 border-gold/80 bg-gold/10" : "size-9 border-white/40"}`}>
          <span className={`font-sub text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-opacity ${label ? "opacity-100" : "opacity-0"}`}>{label}</span>
        </div>
      </div>
    </>
  );
}
