"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import ImageField from "./ImageField";
import type { Field } from "@/lib/admin-resources";

type Opt = { value: string; label: string };

export default function RecordForm({ fields, record, options, action, folder, cancelHref }: {
  fields: Field[];
  record: Record<string, unknown> | null;
  options: Record<string, Opt[]>;
  action: (prev: string | null, fd: FormData) => Promise<string | null>;
  folder: string;
  cancelHref: string;
}) {
  const [error, formAction, pending] = useActionState(action, null);
  const val = (n: string) => record?.[n];
  const isNew = !record;

  return (
    <form action={formAction} className="grid max-w-4xl gap-5 rounded-xl border border-ink/10 bg-white p-6 sm:grid-cols-2">
      {fields.map((f) => {
        const v = val(f.name);
        const span = f.half ? "" : "sm:col-span-2";
        const label = <span className="text-sm font-medium">{f.label}{f.required && <span className="text-red-600"> *</span>}</span>;
        const help = f.help && <span className="mt-1 block text-xs text-ink/50">{f.help}</span>;
        switch (f.type) {
          case "checkbox": {
            const checked = isNew ? f.name === "published" : Boolean(v);
            return (
              <label key={f.name} className={`flex items-center gap-2 self-end py-2 ${span}`}>
                <input type="checkbox" name={f.name} defaultChecked={checked} className="size-4 accent-[#111]" />{label}
              </label>
            );
          }
          case "image":
            return <div key={f.name} className={span}>{label}<ImageField name={f.name} defaultValue={v as string} folder={folder} required={f.required} withSize={f.name === "image_url"} />{help}</div>;
          case "textarea":
            return <label key={f.name} className={span}>{label}<textarea name={f.name} defaultValue={(v as string) ?? ""} rows={4} required={f.required} className="a-input mt-1" />{help}</label>;
          case "list":
            return <label key={f.name} className={span}>{label}<textarea name={f.name} defaultValue={((v as string[]) ?? []).join("\n")} rows={4} className="a-input mt-1" />{help}</label>;
          case "select": {
            const opts = f.options ?? options[f.name] ?? [];
            return (
              <label key={f.name} className={span}>{label}
                <select name={f.name} defaultValue={(v as string) ?? ""} required={f.required} className="a-input mt-1">
                  {!f.required && <option value="">—</option>}
                  {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>{help}
              </label>
            );
          }
          default:
            return (
              <label key={f.name} className={span}>{label}
                <input name={f.name} required={f.required}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"}
                  defaultValue={v === null || v === undefined ? "" : String(v)} className="a-input mt-1" />{help}
              </label>
            );
        }
      })}
      <div className="flex items-center gap-3 border-t border-ink/5 pt-5 sm:col-span-2">
        <button disabled={pending} className="a-btn">{pending && <Loader2 className="size-4 animate-spin" />} Save</button>
        <a href={cancelHref} className="a-btn-ghost">Cancel</a>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
