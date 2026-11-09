import Image from "next/image";

export default function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: string; text?: string; image?: string | null }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line pt-36 pb-20 sm:pt-44 sm:pb-28">
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="parallax -z-20 object-cover object-[50%_30%] opacity-35" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
        </>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <p className="eyebrow animate-fadeup">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-display text-6xl leading-[0.9] tracking-wide text-white sm:text-7xl md:text-8xl">
          {title.split(" ").map((w, i) => (
            <span key={i} className="word mr-[0.2em]"><span style={{ animationDelay: `${0.1 + i * 0.07}s` }}>{w}</span></span>
          ))}
        </h1>
        {text && <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60 animate-fadeup [animation-delay:.45s]">{text}</p>}
      </div>
    </section>
  );
}
