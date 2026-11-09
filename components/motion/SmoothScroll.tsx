"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global { interface Window { __lenis?: Lenis } }

/** Inertia smooth scrolling (desktop + touch-friendly defaults). */
export default function SmoothScroll() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    window.__lenis = lenis;
    let id = 0;
    const raf = (time: number) => { lenis.raf(time); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); window.__lenis = undefined; };
  }, []);
  useEffect(() => { window.__lenis?.scrollTo(0, { immediate: true }); }, [path]);
  return null;
}
