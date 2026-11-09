import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "./types";

export async function getLang(): Promise<Lang> {
  const c = await cookies();
  return c.get("lang")?.value === "sw" ? "sw" : "en";
}
