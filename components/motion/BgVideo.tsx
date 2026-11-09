"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Muted, looping background video. Picks the portrait file on narrow screens,
 * pauses when off-screen, and retries playback on the first touch/scroll if autoplay was blocked.
 */
export default function BgVideo({ src, srcMobile, poster, className = "" }: {
  src: string; srcMobile?: string | null; poster?: string | null; className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<string | null>(null);

  useEffect(() => {
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
    const kick = () => { v.play().catch(() => {}); };
    window.addEventListener("touchstart", kick, { once: true, passive: true });
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("scroll", kick, { once: true, passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("scroll", kick);
    };
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
