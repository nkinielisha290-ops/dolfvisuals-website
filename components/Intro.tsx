"use client";
import { useEffect, useState } from "react";

/** Brand intro shown once per browser session. */
export default function Intro() {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("dv-intro") === "1"; sessionStorage.setItem("dv-intro", "1"); } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setState("gone"); return; }
    document.documentElement.style.overflow = "hidden";
    const a = setTimeout(() => setState("leaving"), 1700);
    const b = setTimeout(() => { setState("gone"); document.documentElement.style.overflow = ""; }, 2600);
    return () => { clearTimeout(a); clearTimeout(b); document.documentElement.style.overflow = ""; };
  }, []);
  if (state === "gone") return null;
  return (
    <div aria-hidden className="fixed inset-0 z-[100] grid place-items-center bg-ink"
      style={state === "leaving" ? { animation: "intro-out .9s cubic-bezier(.77,0,.18,1) forwards" } : undefined}>
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/icon-white.svg" alt="" className="h-20 w-auto sm:h-24" style={{ animation: "intro-icon 1s cubic-bezier(.16,1,.3,1) both" }} />
        <p className="mt-8 font-display text-2xl text-white sm:text-3xl" style={{ animation: "intro-letters 1.2s .25s cubic-bezier(.16,1,.3,1) both" }}>DOLF VISUALS</p>
        <span className="mt-5 block h-px w-40 origin-left bg-gold" style={{ animation: "intro-bar 1.1s .4s cubic-bezier(.77,0,.18,1) both" }} />
      </div>
    </div>
  );
}
