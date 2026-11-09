export default function SectionHead({ eyebrow, title, text, align = "left", dark = true }: {
  eyebrow: string; title: string; text?: string; align?: "left" | "center"; dark?: boolean;
}) {
  return (
    <div className={`reveal max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl ${dark ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {text && <p className={`mt-5 text-base leading-relaxed sm:text-lg ${dark ? "text-white/60" : "text-ink/60"}`}>{text}</p>}
    </div>
  );
}
