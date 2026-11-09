import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, EyeOff, Plus, Star } from "lucide-react";
import PortfolioUploader from "@/components/admin/PortfolioUploader";
import { PageTitle } from "@/components/admin/ui";
import { RESOURCES } from "@/lib/admin-resources";
import { categoryLabel } from "@/lib/i18n";
import { supabaseServer } from "@/lib/supabase/server";
import { togglePublished } from "../../actions";

export default async function ResourceList({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const r = RESOURCES[resource];
  if (!r) notFound();
  const sb = await supabaseServer();
  const { data } = await sb.from(r.table).select("*").order(r.orderBy, { ascending: true });
  const rows = (data ?? []) as Record<string, unknown>[];
  const visField = r.fields.find((f) => f.name === "published" || f.name === "approved")?.name;
  const isPortfolio = r.key === "portfolio";

  const sub = (row: Record<string, unknown>) => {
    const v = r.subtitleField ? row[r.subtitleField] : null;
    if (r.subtitleField === "category") return categoryLabel(String(v), "en");
    if (r.subtitleField === "price") return v ? `TSh ${Number(v).toLocaleString()}` : "On request";
    return v ? String(v) : "";
  };

  return (
    <>
      <PageTitle title={r.label} text={`${rows.length} ${rows.length === 1 ? r.singular : r.singular + "s"}`}
        action={<Link href={`/admin/${r.key}/new`} className="a-btn"><Plus className="size-4" /> Add {r.singular}</Link>} />
      {isPortfolio && <PortfolioUploader />}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink/20 p-10 text-center text-ink/50">Nothing here yet.</p>
      ) : isPortfolio ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {rows.map((row) => (
            <div key={String(row.id)} className={`group overflow-hidden rounded-lg border border-ink/10 bg-white ${row.published ? "" : "opacity-50"}`}>
              <Link href={`/admin/${r.key}/${row.id}`} className="relative block aspect-[4/5] bg-ink/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(row.image_url)} alt="" loading="lazy" className="size-full object-cover" />
                {Boolean(row.featured) && <Star className="absolute left-2 top-2 size-5 text-gold drop-shadow" fill="currentColor" />}
              </Link>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{String(row.title_en || "Untitled")}</p>
                  <p className="truncate text-xs text-ink/50">{sub(row)}</p>
                </div>
                <form action={togglePublished.bind(null, r.key, String(row.id), "published", !row.published)}>
                  <button title={row.published ? "Hide" : "Show"} className="p-1 text-ink/50 hover:text-ink">{row.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-ink/5 overflow-hidden rounded-xl border border-ink/10 bg-white">
          {rows.map((row) => {
            const img = r.imageField ? (row[r.imageField] as string | null) : null;
            const visible = visField ? Boolean(row[visField]) : true;
            return (
              <li key={String(row.id)} className="flex items-center gap-4 p-3 pr-4">
                {r.imageField && (
                  <div className="size-12 shrink-0 overflow-hidden rounded bg-ink/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img && <img src={img} alt="" className="size-full object-cover" />}
                  </div>
                )}
                <Link href={`/admin/${r.key}/${row.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium hover:underline">{String(row[r.titleField] ?? "Untitled")}</p>
                  <p className="truncate text-sm text-ink/50">{sub(row)}</p>
                </Link>
                {visField && (
                  <form action={togglePublished.bind(null, r.key, String(row.id), visField, !visible)}>
                    <button className={`rounded-full px-2.5 py-0.5 text-xs ${visible ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/60"}`}>
                      {visible ? (visField === "approved" ? "Approved" : "Visible") : (visField === "approved" ? "Pending" : "Hidden")}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
