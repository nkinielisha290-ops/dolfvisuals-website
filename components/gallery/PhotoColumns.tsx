import Image from "next/image";
import type { Photo } from "@/lib/photos";

/**
 * Columns of photos drifting slowly up and down (pure CSS, pauses on hover).
 * Each column holds its photos three times so the loop is seamless.
 */
export default function PhotoColumns({ photos, cols = 3, className = "", speed = 60 }: { photos: Photo[]; cols?: number; className?: string; speed?: number }) {
  if (!photos.length) return null;
  const columns = Array.from({ length: cols }, (_, c) => {
    const list = photos.filter((_, i) => i % cols === c);
    return list.length >= 2 ? list : [...list, ...photos].slice(0, 3);
  });
  return (
    <div className={`photo-cols grid gap-3 sm:gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} aria-hidden>
      {columns.map((list, c) => (
        <div key={c} className={`overflow-hidden ${c % 2 ? "pt-16" : ""}`}>
          <div className="photo-col flex flex-col gap-3 sm:gap-4"
            style={{ animation: `${c % 2 ? "coldown" : "colup"} ${speed + c * 12}s linear infinite` }}>
            {[...list, ...list, ...list].map((p, i) => (
              <div key={i} className="relative aspect-[4/5] shrink-0 overflow-hidden rounded-2xl bg-ink-2">
                <Image src={p.src} alt="" fill sizes="(min-width:1024px) 16vw, 30vw" className="object-cover transition-transform duration-700 hover:scale-105" priority={i < 2} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
