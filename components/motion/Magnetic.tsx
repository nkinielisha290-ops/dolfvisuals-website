"use client";
import { useRef } from "react";

/** Pulls its child gently toward the pointer (fine pointers only). */
export default function Magnetic({ children, strength = 0.35, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <span ref={ref} onPointerMove={onMove} onPointerLeave={reset}
      className={`inline-block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${className}`}>
      {children}
    </span>
  );
}
