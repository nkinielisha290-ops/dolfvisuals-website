"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

export type AuthState =
  | null
  | { ok: false; error: "invalid" | "unconfirmed" | "exists" | "password" | "match" | "required" | "generic" | "rate" }
  | { ok: true; message?: "check_email" | "reset_sent" | "saved"; email?: string };

const s = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

/** Only allow redirects back into the site (never to another domain). */
function safeNext(v: string | null | undefined, fallback = "/account") {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : "");
}

function authError(message: string | undefined): AuthState {
  const m = (message ?? "").toLowerCase();
  if (m.includes("not confirmed")) return { ok: false, error: "unconfirmed" };
  if (m.includes("invalid login") || m.includes("invalid credentials")) return { ok: false, error: "invalid" };
  if (m.includes("already registered") || m.includes("already been registered")) return { ok: false, error: "exists" };
  if (m.includes("rate limit") || m.includes("too many")) return { ok: false, error: "rate" };
  if (m.includes("password")) return { ok: false, error: "password" };
  return { ok: false, error: "generic" };
}

export async function signUpClient(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (s(fd, "website")) return { ok: true, message: "check_email" }; // honeypot
  const name = s(fd, "name", 120), phone = s(fd, "phone", 40), email = s(fd, "email", 160).toLowerCase();
  const password = String(fd.get("password") ?? ""), confirm = String(fd.get("confirm") ?? "");
  if (!name || !phone || !email || !password) return { ok: false, error: "required" };
  if (password.length < 8) return { ok: false, error: "password" };
  if (password !== confirm) return { ok: false, error: "match" };

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { dv_client: "true", name, phone }, emailRedirectTo: `${await origin()}/auth/callback?next=/account` },
  });
  if (error) return authError(error.message);
  // Supabase returns a user with no identities when the email is already registered
  if (data.user && (data.user.identities ?? []).length === 0) return { ok: false, error: "exists" };
  if (data.session) redirect("/account"); // email confirmation turned off
  return { ok: true, message: "check_email", email };
}

export async function signInClient(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const email = s(fd, "email", 160).toLowerCase(), password = String(fd.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return authError(error.message);
  redirect(safeNext(s(fd, "next", 200)));
}

export async function signOutClient() {
  if (hasSupabase) await (await supabaseServer()).auth.signOut();
  redirect("/account/login");
}

export async function requestPasswordReset(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const email = s(fd, "email", 160).toLowerCase();
  if (!email) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback?next=/account/reset` });
  if (error?.message.toLowerCase().includes("rate")) return { ok: false, error: "rate" };
  // same answer whether or not the account exists
  return { ok: true, message: "reset_sent" };
}

export async function updatePassword(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const password = String(fd.get("password") ?? ""), confirm = String(fd.get("confirm") ?? "");
  if (password.length < 8) return { ok: false, error: "password" };
  if (password !== confirm) return { ok: false, error: "match" };
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/account/login");
  const { error } = await sb.auth.updateUser({ password });
  if (error) return authError(error.message);
  if (s(fd, "from") === "reset") redirect("/account");
  return { ok: true, message: "saved" };
}

export async function updateProfile(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const name = s(fd, "name", 120), phone = s(fd, "phone", 40);
  if (!name || !phone) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.rpc("dv_update_my_profile", {
    p_name: name, p_phone: phone, p_organization: s(fd, "organization", 160), p_address: s(fd, "address", 240),
  });
  if (error) { console.error("[profile]", error); return { ok: false, error: "generic" }; }
  revalidatePath("/account");
  return { ok: true, message: "saved" };
}
