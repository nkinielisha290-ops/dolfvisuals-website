import SplitText from "./motion/SplitText";

export default function SectionHead({ eyebrow, title, text, align = "left", dark = true }: {
  eyebrow: string; title: string; text?: string; align?: "left" | "center"; dark?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow eyebrow-line">{eyebrow}</p>
      <SplitText as="h2" text={title}
        className={`mt-5 block font-heading text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl ${dark ? "text-white" : "text-ink"}`} />
      {text && <p className={`reveal mt-5 text-base leading-relaxed sm:text-lg ${dark ? "text-white/60" : "text-ink/60"}`}>{text}</p>}
    </div>
  );
}
