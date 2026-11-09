"use client";
import { useState } from "react";
import { Play } from "lucide-react";

export type Film = { id: string; title: string; category: string; poster: string; url: string };

function embed(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return null;
}

/** Cinematic video section: a large featured player plus a strip of other films. */
export default function VideoShowcase({ films }: { films: Film[] }) {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  if (!films.length) return null;
  const f = films[cur];
  const src = embed(f.url);
  const direct = !src;
  return (
    <div>
      <div className="theme-dark relative aspect-video w-full overflow-hidden bg-black">
        {playing ? (
          direct ? (
            <video key={f.url} src={f.url} controls autoPlay playsInline className="size-full object-contain" />
          ) : (
            <iframe key={src} src={src} title={f.title} className="size-full" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          )
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play ${f.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.poster} alt="" className="size-full object-cover transition duration-1000 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-on-gold shadow-2xl transition duration-500 group-hover:scale-110 sm:size-24">
              <Play className="ml-1 size-8" fill="currentColor" />
            </span>
            <span className="absolute bottom-0 left-0 p-5 text-left text-white sm:p-8">
              <span className="eyebrow !text-white/80">{f.category}</span>
              <span className="mt-2 block font-display text-3xl tracking-wide sm:text-5xl">{f.title}</span>
            </span>
          </button>
        )}
      </div>
      {films.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {films.map((x, k) => (
            <button key={x.id} type="button" onClick={() => { setCur(k); setPlaying(true); }}
              className={`group relative aspect-video overflow-hidden text-left ring-2 transition ${k === cur ? "ring-gold" : "ring-transparent hover:ring-white/30"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.poster} alt="" className="size-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-black/30" />
              <Play className="absolute left-3 top-3 size-4 text-white" fill="currentColor" />
              <span className="absolute bottom-2 left-3 right-3 truncate font-sub text-xs text-white">{x.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
