import "server-only";
import { cookies } from "next/headers";

export async function getTheme(): Promise<"dark" | "light"> {
  return (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
}
