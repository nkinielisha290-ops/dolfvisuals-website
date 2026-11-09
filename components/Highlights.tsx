import { getDict, tr } from "@/lib/i18n";
import type { Highlight, Lang } from "@/lib/types";

/** Corporate clients, partners, awards, certificates and press (brief §10). Renders nothing until content is added. */
export default function Highlights({ items, lang }: { items: Highlight[]; lang: Lang }) {
  if (!items.length) return null;
  const t = getDict(lang);
  const logos = items.filter((x) => x.kind === "client" || x.kind === "partner");
  const honours = items.filter((x) => x.kind === "award" || x.kind === "certificate");
  const press = items.filter((x) => x.kind === "press");
  return (
    <section className="border-y border-line">
      {logos.length > 0 && (
        <div className="py-14">
          <p className="eyebrow mx-auto max-w-7xl px-4 sm:px-8">{logos.some((x) => x.kind === "client") ? t.hl_clients : t.hl_partners}</p>
          <div className="mt-8 overflow-hidden">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center gap-16 px-8">
              {[...logos, ...logos, ...logos].map((x, i) => {
                const inner = x.logo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={x.logo_url} alt={tr(x, "title", lang)} className="h-10 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12" />
                  : <span className="font-display text-3xl tracking-wide text-white/50 transition hover:text-white">{tr(x, "title", lang)}</span>;
                return x.link ? <a key={i} href={x.link} target="_blank" rel="noopener noreferrer">{inner}</a> : <span key={i}>{inner}</span>;
              })}
            </div>
          </div>
        </div>
      )}
      {(honours.length > 0 || press.length > 0) && (
        <div className="mx-auto grid max-w-7xl gap-12 border-t border-line px-4 py-16 sm:px-8 md:grid-cols-2">
          {[[t.hl_awards, honours], [t.hl_press, press]].filter(([, l]) => (l as Highlight[]).length).map(([label, list]) => (
            <div key={label as string}>
              <p className="eyebrow">{label as string}</p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {(list as Highlight[]).map((x) => (
                  <li key={x.id} className="flex items-baseline justify-between gap-6 py-4">
                    <div>
                      {x.link ? <a href={x.link} target="_blank" rel="noopener noreferrer" className="font-heading font-bold hover:text-gold">{tr(x, "title", lang)}</a>
                        : <p className="font-heading font-bold">{tr(x, "title", lang)}</p>}
                      {tr(x, "description", lang) && <p className="mt-1 text-sm text-white/55">{tr(x, "description", lang)}</p>}
                    </div>
                    {x.year && <span className="font-display text-2xl text-gold">{x.year}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
