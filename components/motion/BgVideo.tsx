"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Muted, looping background video. Picks the portrait file on narrow screens,
 * pauses when off-screen, retries playback on the first gesture if autoplay was blocked,
 * and can show a small play / pause control.
 */
export default function BgVideo({ src, srcMobile, poster, className = "", toggle, toggleClassName = "", labels = { pause: "Pause video", play: "Play video" } }: {
  src: string; srcMobile?: string | null; poster?: string | null; className?: string;
  toggle?: boolean; toggleClassName?: string; labels?: { pause: string; play: string };
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    setFile(srcMobile && window.matchMedia("(max-width: 767px)").matches ? srcMobile : src);
  }, [src, srcMobile]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !file) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.05 });
    io.observe(v);
    const kick = () => { if (!userPaused.current) v.play().catch(() => {}); };
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

  const flip = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); } else { userPaused.current = true; v.pause(); }
  };

  return (
    <>
      <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poster && <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />}
        {file && (
          <video ref={ref} key={file} src={file} poster={poster ?? undefined} autoPlay muted loop playsInline preload="auto"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-1000"
            onPlaying={(e) => { e.currentTarget.style.opacity = "1"; setPaused(false); }} onPause={() => setPaused(true)} />
        )}
      </div>
      {toggle && file && (
        <button type="button" onClick={flip} aria-label={paused ? labels.play : labels.pause}
          className={`grid size-11 place-items-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-md transition hover:border-gold hover:bg-gold hover:text-on-gold ${toggleClassName}`}>
          {paused ? <Play className="ml-0.5 size-4" fill="currentColor" /> : <Pause className="size-4" fill="currentColor" />}
        </button>
      )}
    </>
  );
}
