"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

export type GalleryItem = {
  id: string;
  src: string;
  w: number;
  h: number;
  title: string;
  category: string;
  categoryLabel: string;
  videoUrl: string | null;
};

function embedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return null;
}

export default function Gallery({ items, allLabel, closeLabel, filter = true, initialCategory = "all" }: {
  items: GalleryItem[]; allLabel: string; closeLabel: string; filter?: boolean; initialCategory?: string;
}) {
  const [cat, setCat] = useState(initialCategory);
  const [idx, setIdx] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const cats = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach((i) => m.set(i.category, i.categoryLabel));
    return Array.from(m, ([slug, label]) => ({ slug, label }));
  }, [items]);
  const shown = cat === "all" ? items : items.filter((i) => i.category === cat);

  const close = useCallback(() => setIdx(null), []);
  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [idx, close, step]);

  const current = idx !== null ? shown[idx] : null;
  const embed = current?.videoUrl ? embedUrl(current.videoUrl) : null;

  return (
    <div>
      {filter && cats.length > 1 && (
        <div className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ slug: "all", label: allLabel }, ...cats].map((c) => (
            <button key={c.slug} type="button" onClick={() => setCat(c.slug)}
              className={`shrink-0 border px-4 py-2 font-sub text-xs tracking-wider transition ${cat === c.slug ? "border-gold bg-gold text-ink" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"}`}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div key={cat} className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {shown.map((it, i) => (
          <button key={it.id} type="button" onClick={() => setIdx(i)} data-cursor={it.videoUrl ? "Play" : "View"}
            style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
            className="animate-fadeup group relative mb-3 block w-full overflow-hidden bg-ink-2 text-left sm:mb-4 break-inside-avoid">
            <Image src={it.src} alt={it.title} width={it.w} height={it.h}
              sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
              className="h-auto w-full transition duration-700 group-hover:scale-[1.04]" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="eyebrow !text-[0.6rem]">{it.categoryLabel}</span>
              <span className="mt-1 block font-sub text-sm text-white">{it.title}</span>
            </span>
            {it.videoUrl && (
              <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold/90 text-ink">
                <Play className="ml-0.5 size-6" fill="currentColor" />
              </span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div role="dialog" aria-modal="true" aria-label={current.title}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 animate-fadeup [animation-duration:.3s]"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}>
          <button type="button" onClick={close} aria-label={closeLabel} className="absolute right-4 top-4 z-10 p-2 text-white/80 hover:text-gold">
            <X className="size-8" />
          </button>
          {shown.length > 1 && (
            <>
              <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-2 z-10 hidden p-3 text-white/70 hover:text-gold sm:block"><ChevronLeft className="size-10" /></button>
              <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-2 z-10 hidden p-3 text-white/70 hover:text-gold sm:block"><ChevronRight className="size-10" /></button>
            </>
          )}
          <div className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center px-4 py-16 sm:px-20" onClick={(e) => e.stopPropagation()}>
            {embed ? (
              <div className="aspect-video w-full bg-black">
                <iframe src={embed} title={current.title} className="size-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
              </div>
            ) : (
              <div className="relative h-full w-full">
                <Image key={current.id} src={current.src} alt={current.title} fill sizes="100vw" className="object-contain animate-fadeup [animation-duration:.4s]" />
              </div>
            )}
            <div className="mt-4 flex w-full items-baseline justify-between gap-4 text-sm">
              <p><span className="eyebrow mr-3 !text-[0.62rem]">{current.categoryLabel}</span><span className="text-white/80">{current.title}</span></p>
              <p className="font-sub text-xs text-white/40">{(idx ?? 0) + 1} / {shown.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
