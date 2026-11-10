import Image from "next/image";
import type { Photo } from "@/lib/photos";

/** A continuous horizontal ribbon of photos. */
export default function PhotoMarquee({ photos, reverse = false, height = "h-64 sm:h-80", speed = 70, rounded = true }: {
  photos: Photo[]; reverse?: boolean; height?: string; speed?: number; rounded?: boolean;
}) {
  if (!photos.length) return null;
  const list = photos.length < 8 ? [...photos, ...photos] : photos;
  return (
    <div className="photo-marquee overflow-hidden" aria-hidden>
      <div className="flex w-max gap-3 sm:gap-4" style={{ animation: `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}` }}>
        {[...list, ...list].map((p, i) => (
          <div key={i} className={`relative aspect-[4/5] shrink-0 overflow-hidden bg-ink-2 ${height} ${rounded ? "rounded-2xl" : ""}`}>
            <Image src={p.src} alt="" fill sizes="(min-width:640px) 260px, 200px" className="object-cover transition-transform duration-700 hover:scale-105" />
          </div>
        ))}
      </div>
    </div>
  );
}
