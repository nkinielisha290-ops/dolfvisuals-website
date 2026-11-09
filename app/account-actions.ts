"use server";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

export type AuthError =
  | "invalid" | "unconfirmed" | "exists" | "password" | "weak" | "pwned" | "match" | "required" | "generic" | "rate"
  | "captcha" | "current" | "code" | "phone";
export type AuthState =
  | null
  | { ok: false; error: AuthError; email?: string }
  | { ok: true; message?: "check_email" | "reset_sent" | "link_sent" | "resent" | "saved" | "signed_out_others"; email?: string };

const s = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

/** Only allow redirects back into this site (never to another domain). */
function safeNext(v: string | null | undefined, fallback = "/account") {
  return v && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : fallback;
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

/* ---------- abuse protection ---------- */

// Per-visitor throttle on top of Supabase's own auth rate limits (best effort on serverless).
const attempts = new Map<string, number[]>();
async function throttled(bucket: string, max: number, windowMs = 10 * 60_000) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  attempts.set(key, list);
  if (attempts.size > 5000) attempts.clear();
  return list.length > max;
}

/** Optional Cloudflare Turnstile token (verified by Supabase when CAPTCHA protection is switched on). */
const captcha = (fd: FormData) => s(fd, "cf-turnstile-response", 4096) || undefined;

/** Password rules: 8+ characters with letters and numbers, not a common / leaked password. */
function weakPassword(pw: string, email = "") {
  if (pw.length < 8) return "password" as const;
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "weak" as const;
  const local = email.split("@")[0]?.toLowerCase();
  if (local && local.length > 3 && pw.toLowerCase().includes(local)) return "weak" as const;
  return null;
}

/** Have I Been Pwned range check (k-anonymity: only the first 5 hash characters leave the server). */
async function pwned(pw: string) {
  try {
    const hash = createHash("sha1").update(pw).digest("hex").toUpperCase();
    const r = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" }, signal: AbortSignal.timeout(3000), cache: "no-store",
    });
    if (!r.ok) return false;
    const suffix = hash.slice(5);
    return (await r.text()).split("\n").some((line) => {
      const [h, n] = line.trim().split(":");
      return h === suffix && Number(n) > 0;
    });
  } catch {
    return false; // never block sign-up because the check service is down
  }
}

function authError(message: string | undefined, email?: string): AuthState {
  const m = (message ?? "").toLowerCase();
  if (m.includes("not confirmed")) return { ok: false, error: "unconfirmed", email };
  if (m.includes("invalid login") || m.includes("invalid credentials")) return { ok: false, error: "invalid" };
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("already exists")) return { ok: false, error: "exists" };
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return { ok: false, error: "rate" };
  if (m.includes("captcha")) return { ok: false, error: "captcha" };
  if (m.includes("pwned") || m.includes("leaked") || m.includes("known to be weak")) return { ok: false, error: "pwned" };
  if (m.includes("password")) return { ok: false, error: "weak" };
  if (m.includes("code") || m.includes("otp") || m.includes("expired") || m.includes("invalid totp")) return { ok: false, error: "code" };
  return { ok: false, error: "generic" };
}

/** After any sign-in: link the account to its client record and, if 2FA is on, ask for the code. */
async function finishSignIn(next: string): Promise<never> {
  const sb = await supabaseServer();
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect(`/account/verify?next=${encodeURIComponent(next)}`);
  await sb.rpc("dv_claim_account");
  redirect(next);
}

/* ---------- sign up / sign in ---------- */

export async function signUpClient(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (s(fd, "website")) return { ok: true, message: "check_email" }; // honeypot
  if (await throttled("signup", 6)) return { ok: false, error: "rate" };
  const name = s(fd, "name", 120), phone = s(fd, "phone", 40), email = s(fd, "email", 160).toLowerCase();
  const password = String(fd.get("password") ?? ""), confirm = String(fd.get("confirm") ?? "");
  if (!name || !phone || !email || !password) return { ok: false, error: "required" };
  if (phone.replace(/\D/g, "").length < 9) return { ok: false, error: "phone" };
  const weak = weakPassword(password, email);
  if (weak) return { ok: false, error: weak };
  if (password !== confirm) return { ok: false, error: "match" };
  if (await pwned(password)) return { ok: false, error: "pwned" };

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: {
      data: { dv_client: "true", name, phone },
      emailRedirectTo: `${await origin()}/auth/callback?next=/account`,
      captchaToken: captcha(fd),
    },
  });
  if (error) return authError(error.message, email);
  // Supabase hides whether an address exists: a user with no identities means it is already registered
  if (data.user && (data.user.identities ?? []).length === 0) return { ok: false, error: "exists" };
  if (data.session) await finishSignIn("/account"); // only when email confirmation is switched off
  return { ok: true, message: "check_email", email };
}

export async function signInClient(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (await throttled("signin", 10)) return { ok: false, error: "rate" };
  const email = s(fd, "email", 160).toLowerCase(), password = String(fd.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password, options: { captchaToken: captcha(fd) } });
  if (error) return authError(error.message, email);
  return finishSignIn(safeNext(s(fd, "next", 300)));
}

export async function signInWithGoogle(fd: FormData) {
  if (!hasSupabase) redirect("/account/login");
  const next = safeNext(s(fd, "next", 300));
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/account/login?error=google");
  redirect(data.url);
}

/** Passwordless: one-time sign-in link by email (existing accounts only). */
export async function sendMagicLink(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (await throttled("magic", 5)) return { ok: false, error: "rate" };
  const email = s(fd, "email", 160).toLowerCase();
  if (!email) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(safeNext(s(fd, "next", 300)))}`, captchaToken: captcha(fd) },
  });
  const e = error ? authError(error.message) : null;
  if (e && !e.ok && (e.error === "rate" || e.error === "captcha")) return e;
  return { ok: true, message: "link_sent", email }; // same answer whether or not the account exists
}

export async function resendVerification(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (await throttled("resend", 4)) return { ok: false, error: "rate" };
  const email = s(fd, "email", 160).toLowerCase();
  if (!email) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${await origin()}/auth/callback?next=/account` } });
  const e = error ? authError(error.message) : null;
  if (e && !e.ok && e.error === "rate") return e;
  return { ok: true, message: "resent", email };
}

export async function signOutClient() {
  if (hasSupabase) await (await supabaseServer()).auth.signOut({ scope: "local" });
  redirect("/account/login");
}

export async function signOutOtherDevices(): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const { error } = await (await supabaseServer()).auth.signOut({ scope: "others" });
  if (error) return { ok: false, error: "generic" };
  return { ok: true, message: "signed_out_others" };
}

/* ---------- passwords ---------- */

export async function requestPasswordReset(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (await throttled("reset", 5)) return { ok: false, error: "rate" };
  const email = s(fd, "email", 160).toLowerCase();
  if (!email) return { ok: false, error: "required" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback?next=/account/reset`, captchaToken: captcha(fd) });
  const e = error ? authError(error.message) : null;
  if (e && !e.ok && (e.error === "rate" || e.error === "captcha")) return e;
  return { ok: true, message: "reset_sent" };
}

/** Set a new password. From the settings page the current password is required first. */
export async function updatePassword(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const password = String(fd.get("password") ?? ""), confirm = String(fd.get("confirm") ?? "");
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/account/login");
  const fromReset = s(fd, "from") === "reset";
  const hasPassword = (user.identities ?? []).some((i) => i.provider === "email");

  if (!fromReset && hasPassword) {
    if (await throttled("pwchange", 6)) return { ok: false, error: "rate" };
    const current = String(fd.get("current") ?? "");
    if (!current) return { ok: false, error: "required" };
    // check the current password on a separate, cookie-less client so this session is untouched
    const probe = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: wrong } = await probe.auth.signInWithPassword({ email: user.email ?? "", password: current });
    if (wrong) return { ok: false, error: "current" };
    await probe.auth.signOut({ scope: "local" });
  }
  const weak = weakPassword(password, user.email ?? "");
  if (weak) return { ok: false, error: weak };
  if (password !== confirm) return { ok: false, error: "match" };
  if (await pwned(password)) return { ok: false, error: "pwned" };

  const { error } = await sb.auth.updateUser({ password });
  if (error) return authError(error.message);
  if (fromReset) await finishSignIn("/account");
  return { ok: true, message: "saved" };
}

/* ---------- profile ---------- */

export async function updateProfile(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const name = s(fd, "name", 120), phone = s(fd, "phone", 40);
  if (!name || !phone) return { ok: false, error: "required" };
  if (phone.replace(/\D/g, "").length < 9) return { ok: false, error: "phone" };
  const sb = await supabaseServer();
  const { error } = await sb.rpc("dv_update_my_profile", {
    p_name: name, p_phone: phone, p_organization: s(fd, "organization", 160), p_address: s(fd, "address", 240),
  });
  if (error) { console.error("[profile]", error.message); return { ok: false, error: "generic" }; }
  revalidatePath("/account", "layout");
  return { ok: true, message: "saved" };
}

/* ---------- two-step verification (authenticator app, TOTP) ---------- */

export type EnrollState = null | { ok: false; error: AuthError } | { ok: true; factorId: string; qr: string; secret: string };

export async function startMfaEnroll(): Promise<EnrollState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const sb = await supabaseServer();
  // clean up unfinished set-ups so the new one is not rejected
  const { data: list } = await sb.auth.mfa.listFactors();
  for (const f of list?.all ?? []) if (f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`, issuer: "DOLF VISUALS" });
  if (error || !data) { console.error("[mfa]", error?.message); return { ok: false, error: "generic" }; }
  return { ok: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function confirmMfaEnroll(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (await throttled("mfa", 10)) return { ok: false, error: "rate" };
  const factorId = s(fd, "factorId", 80), code = s(fd, "code", 10).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "code" };
  const sb = await supabaseServer();
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { ok: false, error: "code" };
  revalidatePath("/account/settings");
  return { ok: true, message: "saved" };
}

export async function disableMfa(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  const sb = await supabaseServer();
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") return { ok: false, error: "code" };
  const { error } = await sb.auth.mfa.unenroll({ factorId: s(fd, "factorId", 80) });
  if (error) return { ok: false, error: "generic" };
  revalidatePath("/account/settings");
  return { ok: true, message: "saved" };
}

/** Second step at sign-in: the 6-digit code from the authenticator app. */
export async function verifyMfaSignIn(_p: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasSupabase) return { ok: false, error: "generic" };
  if (await throttled("mfa", 10)) return { ok: false, error: "rate" };
  const code = s(fd, "code", 10).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "code" };
  const sb = await supabaseServer();
  const { data: list } = await sb.auth.mfa.listFactors();
  const factor = list?.totp?.[0];
  if (!factor) return finishSignIn(safeNext(s(fd, "next", 300)));
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { ok: false, error: "code" };
  return finishSignIn(safeNext(s(fd, "next", 300)));
}
