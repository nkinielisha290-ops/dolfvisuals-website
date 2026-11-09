"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const R = 22, C = 2 * Math.PI * R;

export default function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  const circle = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      setShow(scrollY > innerHeight * 0.8);
      if (circle.current) circle.current.style.strokeDashoffset = String(C * (1 - p));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const top = () => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }));
  return (
    <button type="button" onClick={top} aria-label={label} data-cursor="Top"
      className={`group fixed bottom-24 right-5 z-40 grid size-14 place-items-center rounded-full bg-ink-2/90 text-white shadow-lg shadow-black/40 backdrop-blur transition-all duration-500 hover:bg-gold hover:text-on-gold ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <svg viewBox="0 0 50 50" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="25" cy="25" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
        <circle ref={circle} cx="25" cy="25" r={R} fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-500 group-hover:-translate-y-1" />
    </button>
  );
}
