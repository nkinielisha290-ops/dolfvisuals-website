// Generates supabase/seed.sql from lib/seed.ts
// Run: node --experimental-strip-types scripts/gen-seed-sql.mts
import { writeFileSync } from "node:fs";
import * as S from "../lib/seed.ts";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(",")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const insert = (table: string, rows: Record<string, unknown>[], skip: string[] = ["id"]) =>
  rows.map((r) => {
    const keys = Object.keys(r).filter((k) => !skip.includes(k));
    return `insert into public.${table} (${keys.join(",")}) values (${keys.map((k) => q(r[k])).join(",")});`;
  }).join("\n");

const { id: _id, ...settings } = S.seedSettings;
const sql = `-- DOLF VISUALS starting content (generated from lib/seed.ts). Run after schema.sql.
insert into public.settings (id,${Object.keys(settings).join(",")}) values (1,${Object.values(settings).map(q).join(",")})
on conflict (id) do nothing;

${insert("services", S.seedServices as never)}

${insert("packages", S.seedPackages as never)}

${insert("portfolio_items", S.seedPortfolio as never)}
`;
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("wrote supabase/seed.sql");
