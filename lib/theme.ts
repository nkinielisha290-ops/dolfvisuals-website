import "server-only";
import { cookies } from "next/headers";

/** Bright gallery look by default; visitors can switch to dark. */
export async function getTheme(): Promise<"dark" | "light"> {
  return (await cookies()).get("theme")?.value === "dark" ? "dark" : "light";
}
