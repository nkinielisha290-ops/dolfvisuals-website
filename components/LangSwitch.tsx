"use client";
import { useTransition } from "react";
import { setLang } from "@/app/actions";
import type { Lang } from "@/lib/types";

export default function LangSwitch({ lang, className = "" }: { lang: Lang; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <div className={`flex items-center font-sub text-xs tracking-[0.2em] ${pending ? "opacity-50" : ""} ${className}`} role="group" aria-label="Language">
      {(["en", "sw"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-2 text-white/25">/</span>}
          <button type="button" onClick={() => start(() => setLang(l))} aria-pressed={lang === l}
            className={`uppercase transition ${lang === l ? "text-gold" : "text-white/55 hover:text-white"}`}>
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
