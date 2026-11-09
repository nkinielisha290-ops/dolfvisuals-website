"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Muted, looping background video. Picks the portrait file on narrow screens,
 * pauses when off-screen, and shows only the poster for reduced-motion users.
 */
export default function BgVideo({ src, srcMobile, poster, className = "" }: {
  src: string; srcMobile?: string | null; poster?: string | null; className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    setFile(srcMobile && window.matchMedia("(max-width: 767px)").matches ? srcMobile : src);
  }, [src, srcMobile]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !file) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.05 });
    io.observe(v);
    return () => io.disconnect();
  }, [file]);

  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {poster && <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />}
      {file && (
        <video ref={ref} key={file} src={file} poster={poster ?? undefined} autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-1000"
          onPlaying={(e) => (e.currentTarget.style.opacity = "1")} />
      )}
    </div>
  );
}
