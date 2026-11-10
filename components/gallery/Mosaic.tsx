import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type MosaicItem = { src: string; title: string; label?: string; href?: string; w?: number | null; h?: number | null };

/** Masonry wall of photos with a light caption tag that slides up on hover. */
export default function Mosaic({ items, cols = "columns-2 md:columns-3 xl:columns-4" }: { items: MosaicItem[]; cols?: string }) {
  return (
    <div className={`${cols} gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4`}>
      {items.map((p, i) => {
        const inner = (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-ink-2" style={{ aspectRatio: p.w && p.h ? `${p.w}/${p.h}` : i % 3 === 1 ? "3/4" : "4/5" }}>
              <Image src={p.src} alt={p.title} fill sizes="(min-width:1280px) 24vw, (min-width:768px) 32vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]" />
              <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between gap-2 rounded-full bg-[#fff]/95 py-1.5 pl-4 pr-1.5 text-[#111] opacity-0 shadow-lg backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="min-w-0">
                  <span className="block truncate font-sub text-xs font-semibold">{p.title}</span>
                  {p.label && <span className="block truncate text-[0.6rem] uppercase tracking-[0.15em] text-black/50">{p.label}</span>}
                </span>
                {p.href && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#111] text-[#d4af37]"><ArrowUpRight className="size-4" /></span>}
              </div>
            </div>
          </>
        );
        return p.href ? (
          <Link key={i} href={p.href} className="reveal group block break-inside-avoid" style={{ transitionDelay: `${(i % 4) * 90}ms` }}>{inner}</Link>
        ) : (
          <div key={i} className="reveal group break-inside-avoid" style={{ transitionDelay: `${(i % 4) * 90}ms` }}>{inner}</div>
        );
      })}
    </div>
  );
}
