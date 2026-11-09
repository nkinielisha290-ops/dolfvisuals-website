import Link from "next/link";
import { Clock } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcons";
import type { AccDict } from "@/lib/i18n-account";

export default function NotConfigured({ a, whatsapp, bookLabel }: { a: AccDict; whatsapp: string; bookLabel: string }) {
  return (
    <div className="border border-gold/30 bg-ink-2 p-8">
      <Clock className="size-9 text-gold" />
      <h2 className="mt-4 font-heading text-xl font-bold">{a.not_configured_title}</h2>
      <p className="mt-2 text-white/60">{a.not_configured_text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/booking" className="btn-gold">{bookLabel}</Link>
        <a href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          <SocialIcon name="whatsapp" className="size-4" /> {a.whatsapp}
        </a>
      </div>
    </div>
  );
}
