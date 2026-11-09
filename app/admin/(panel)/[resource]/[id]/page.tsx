import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RecordForm from "@/components/admin/RecordForm";
import { PageTitle } from "@/components/admin/ui";
import { RESOURCES } from "@/lib/admin-resources";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteRecord, saveRecord } from "../../../actions";

export default async function EditRecord({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const r = RESOURCES[resource];
  if (!r) notFound();
  const sb = await supabaseServer();

  let record: Record<string, unknown> | null = null;
  if (id !== "new") {
    const { data } = await sb.from(r.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    record = data;
  }

  const options: Record<string, { value: string; label: string }[]> = {};
  for (const f of r.fields) {
    if (!f.optionsFrom) continue;
    const { data } = await sb.from(f.optionsFrom.table).select(`${f.optionsFrom.value},${f.optionsFrom.label}`).order(f.optionsFrom.label);
    options[f.name] = ((data ?? []) as unknown as Record<string, string>[]).map((o) => ({ value: o[f.optionsFrom!.value], label: o[f.optionsFrom!.label] }));
  }

  return (
    <>
      <Link href={`/admin/${r.key}`} className="mb-4 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink"><ArrowLeft className="size-4" /> {r.label}</Link>
      <PageTitle title={record ? `Edit ${r.singular}` : `Add ${r.singular}`}
        action={record && (
          <form action={deleteRecord.bind(null, r.key, id)}>
            <button className="text-sm text-red-600 hover:underline">Delete {r.singular}</button>
          </form>
        )} />
      <RecordForm fields={r.fields} record={record} options={options} folder={r.key}
        action={saveRecord.bind(null, r.key, id)} cancelHref={`/admin/${r.key}`} />
    </>
  );
}
