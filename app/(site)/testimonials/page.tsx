import type { Metadata } from "next";
import { Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getTestimonials } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Testimonials", description: "What clients say about DOLF VISUALS." };

function embed(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}?rel=0` : null;
}

export default async function Testimonials() {
  const lang = await getLang();
  const t = getDict(lang);
  const items = await getTestimonials();
  const videos = items.filter((x) => x.video_url && embed(x.video_url));
  return (
    <>
      <PageHero page="testimonials" eyebrow={t.testi_eyebrow} title={t.testi_title} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-24">
        {items.length === 0 ? (
          <p className="border border-dashed border-line p-12 text-center text-white/45">{t.testi_empty}</p>
        ) : (
          <>
            {videos.length > 0 && (
              <div className="mb-16 grid gap-6 md:grid-cols-2">
                {videos.map((v) => (
                  <div key={v.id} className="reveal">
                    <div className="aspect-video bg-black"><iframe src={embed(v.video_url!)!} title={v.name} className="size-full" allowFullScreen /></div>
                    <p className="mt-3 font-sub text-sm text-white/70">{v.name}{v.organization ? ` — ${v.organization}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
              {items.map((x) => (
                <figure key={x.id} className="reveal mb-6 break-inside-avoid border border-line p-8">
                  {x.rating && <div className="flex gap-1 text-gold">{Array.from({ length: x.rating }).map((_, i) => <Star key={i} className="size-4" fill="currentColor" />)}</div>}
                  <blockquote className="mt-4 leading-relaxed text-white/80">“{tr(x, "quote", lang)}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {x.photo_url && <img src={x.photo_url} alt="" className="size-11 rounded-full object-cover" />}
                    <span className="font-sub text-sm"><span className="block text-white">{x.name}</span>{x.organization && <span className="text-white/40">{x.organization}</span>}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
