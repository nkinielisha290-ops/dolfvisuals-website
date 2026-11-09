/** Word-by-word reveal. Animates when it (or a parent .reveal) gets the `.in` class. */
export default function SplitText({ text, className = "", as: Tag = "span", delay = 0, step = 0.05 }: {
  text: string; className?: string; as?: "span" | "h1" | "h2" | "h3" | "p"; delay?: number; step?: number;
}) {
  return (
    <Tag className={`split ${className}`} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="split-w">
          <span style={{ transitionDelay: `${delay + i * step}s` }}>{w}</span>
        </span>
      ))}
    </Tag>
  );
}
