/** Circular text badge that slowly rotates around the brand mark. */
export default function RotatingBadge({ text, href, label, className = "" }: { text: string; href: string; label: string; className?: string }) {
  return (
    <a href={href} aria-label={label} className={`group relative grid size-32 place-items-center sm:size-36 ${className}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-[spin_18s_linear_infinite] text-white group-hover:[animation-duration:6s]" aria-hidden>
        <defs><path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text className="fill-current font-sub text-[15px] font-semibold uppercase tracking-[0.32em]"><textPath href="#badge-circle">{text}</textPath></text>
      </svg>
      <span className="grid size-16 place-items-center rounded-full bg-gold text-on-gold transition duration-500 group-hover:scale-110 sm:size-[4.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/icon-black.svg" alt="" className="h-7 w-auto" />
      </span>
    </a>
  );
}
