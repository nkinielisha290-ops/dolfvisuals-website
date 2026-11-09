"use client";
import { useEffect, useRef } from "react";

/** Big statement whose words light up as the section scrolls through the viewport. */
export default function ScrollHighlight({ text, highlight = [], className = "" }: { text: string; highlight?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    let id = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.floor(p * words.length * 1.05);
      words.forEach((w, i) => w.classList.toggle("lit", i < lit));
    };
    const on = () => { cancelAnimationFrame(id); id = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [text]);
  const hl = new Set(highlight.map((h) => h.toLowerCase()));
  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className={`hl-word ${hl.has(w.toLowerCase().replace(/[^\p{L}]/gu, "")) ? "hl-gold" : ""}`}>{w} </span>
      ))}
    </p>
  );
}
