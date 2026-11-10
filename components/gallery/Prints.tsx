import Image from "next/image";
import type { Photo } from "@/lib/photos";

/** Three photo prints fanned out like on a table, with white borders and soft shadows. */
export default function Prints({ photos, className = "" }: { photos: Photo[]; className?: string }) {
  const [a, b, c] = photos;
  if (!a) return null;
  const print = "absolute overflow-hidden bg-[#fff] p-2.5 pb-9 shadow-[0_30px_60px_-20px_rgba(0,0,0,.35)] ring-1 ring-black/5 transition-transform duration-700 sm:p-3 sm:pb-12";
  return (
    <div className={`prints relative ${className}`}>
      {c && (
        <div className={`${print} left-[2%] top-[14%] w-[46%] -rotate-[8deg] animate-[print-in_1s_.35s_cubic-bezier(.2,.8,.2,1)_backwards] hover:-rotate-[4deg]`}>
          <div className="relative aspect-[4/5]"><Image src={c.src} alt={c.alt} fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" /></div>
        </div>
      )}
      {b && (
        <div className={`${print} right-[2%] top-[6%] w-[46%] rotate-[7deg] animate-[print-in_1s_.5s_cubic-bezier(.2,.8,.2,1)_backwards] hover:rotate-[3deg]`}>
          <div className="relative aspect-[4/5]"><Image src={b.src} alt={b.alt} fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" /></div>
        </div>
      )}
      <div className={`${print} left-1/2 top-[22%] z-10 w-[52%] -translate-x-1/2 animate-[print-in_1s_.2s_cubic-bezier(.2,.8,.2,1)_backwards] hover:scale-[1.02]`}>
        <div className="relative aspect-[4/5]"><Image src={a.src} alt={a.alt} fill priority sizes="(min-width:1024px) 24vw, 50vw" className="object-cover" /></div>
      </div>
    </div>
  );
}
