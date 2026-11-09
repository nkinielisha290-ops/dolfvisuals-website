"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export default function ThemeToggle({ className = "", labels }: { className?: string; labels: { light: string; dark: string } }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => { setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark"); }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.add("theme-switching");
    html.dataset.theme = next;
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f7f5f0" : "#111111");
    setTheme(next);
    window.setTimeout(() => html.classList.remove("theme-switching"), 600);
  };

  const label = theme === "dark" ? labels.light : labels.dark;
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      className={`group relative grid size-9 place-items-center overflow-hidden rounded-full border border-white/20 text-white/80 transition hover:border-gold hover:text-gold ${className}`}>
      <Sun className={`absolute size-4 transition-all duration-500 ${theme === "dark" ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-6 rotate-90 opacity-0"}`} />
      <Moon className={`absolute size-4 transition-all duration-500 ${theme === "light" ? "translate-y-0 rotate-0 opacity-100" : "translate-y-6 -rotate-90 opacity-0"}`} />
    </button>
  );
}
