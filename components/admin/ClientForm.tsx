"use client";
import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CLIENT_SOURCES, label } from "@/lib/crm";
import type { Client } from "@/lib/types";

export default function ClientForm({ client, action }: { client: Client | null; action: (p: string | null, fd: FormData) => Promise<string | null> }) {
  const [state, formAction, pending] = useActionState(action, null);
  const f = (k: keyof Client) => (client?.[k] as string | null) ?? "";
  return (
    <form action={formAction} className="grid gap-4 rounded-xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">Full name / company *<input name="name" required defaultValue={f("name")} className="a-input mt-1" /></label>
      <label className="text-sm font-medium">Phone / WhatsApp<input name="phone" defaultValue={f("phone")} placeholder="+255…" className="a-input mt-1" /></label>
      <label className="text-sm font-medium">Email<input name="email" type="email" defaultValue={f("email")} className="a-input mt-1" /></label>
      <label className="text-sm font-medium">Organization<input name="organization" defaultValue={f("organization")} className="a-input mt-1" /></label>
      <label className="text-sm font-medium">How they found us
        <select name="source" defaultValue={client?.source ?? "whatsapp"} className="a-input mt-1">
          {CLIENT_SOURCES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium sm:col-span-2">Address<input name="address" defaultValue={f("address")} className="a-input mt-1" /></label>
      <label className="text-sm font-medium sm:col-span-2">Notes<textarea name="notes" rows={3} defaultValue={f("notes")} className="a-input mt-1" /></label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="a-btn">{pending && <Loader2 className="size-4 animate-spin" />} {client ? "Save client" : "Register client"}</button>
        {state === "saved" && <span className="flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 className="size-4" /> Saved</span>}
        {state && state !== "saved" && <span className="text-sm text-red-600">{state}</span>}
      </div>
    </form>
  );
}
