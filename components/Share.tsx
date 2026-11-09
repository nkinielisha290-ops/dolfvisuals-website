"use client";
import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { SocialIcon } from "./SocialIcons";

/** Social sharing: native share sheet on phones, plus WhatsApp / Facebook / X / LinkedIn / copy link. */
export default function Share({ title, path, labels }: { title: string; path?: string; labels: { share: string; copy: string; copied: string } }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => {
    setUrl(path ? new URL(path, location.origin).toString() : location.href);
    setNative(typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches);
  }, [path]);
  const u = encodeURIComponent(url), tx = encodeURIComponent(title);
  const links = [
    { k: "whatsapp", href: `https://wa.me/?text=${tx}%20${u}`, label: "WhatsApp" },
    { k: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, label: "Facebook" },
    { k: "x", href: `https://twitter.com/intent/tweet?text=${tx}&url=${u}`, label: "X" },
    { k: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, label: "LinkedIn" },
  ];
  const btn = "grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label mr-2">{labels.share}</span>
      {native && (
        <button type="button" className={btn} aria-label={labels.share} onClick={() => navigator.share({ title, url }).catch(() => {})}><Share2 className="size-4" /></button>
      )}
      {links.map((l) => (
        <a key={l.k} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} className={btn}>
          {l.k === "x" ? <span className="font-sub text-sm font-semibold">𝕏</span> : <SocialIcon name={l.k} className="size-4" />}
        </a>
      ))}
      <button type="button" className={btn} aria-label={copied ? labels.copied : labels.copy}
        onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} }}>
        {copied ? <Check className="size-4 text-gold" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
