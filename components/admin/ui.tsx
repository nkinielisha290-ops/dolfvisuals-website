export function PageTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        {text && <p className="mt-1 text-sm text-ink/60">{text}</p>}
      </div>
      {action}
    </div>
  );
}

const tone: Record<string, string> = {
  new: "bg-gold/25 text-[#7a5f0c]", contacted: "bg-blue-100 text-blue-800", quoted: "bg-violet-100 text-violet-800",
  confirmed: "bg-emerald-100 text-emerald-800", completed: "bg-ink/10 text-ink/70", cancelled: "bg-red-100 text-red-700",
  read: "bg-ink/10 text-ink/70", replied: "bg-emerald-100 text-emerald-800",
};
export function StatusPill({ s }: { s: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone[s] ?? "bg-ink/10"}`}>{s}</span>;
}

export function waNumber(phone: string) {
  let d = phone.replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "255" + d.slice(1);
  return d;
}

export function fmtDate(iso: string | null, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });
}
