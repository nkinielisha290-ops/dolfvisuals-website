import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

/** Returns a session-bound Supabase client, or redirects / throws if the user is not an admin. */
export async function requireAdmin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("dv_is_admin");
  if (!ok) throw new Error("Not authorised");
  return sb;
}
