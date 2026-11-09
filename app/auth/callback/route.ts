import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

/** Landing point for Google sign-in and email links (confirmation, sign-in link, password reset). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const raw = url.searchParams.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/account";
  const fail = (why: string) => NextResponse.redirect(new URL(`/account/login?error=${why}`, url.origin));
  if (!hasSupabase) return fail("link");
  if (url.searchParams.get("error")) return fail(url.searchParams.get("error_code") === "otp_expired" ? "expired" : "link");

  const sb = await supabaseServer();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await sb.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };
  if (error) return fail("expired");

  const dest = type === "recovery" || next === "/account/reset" ? "/account/reset" : next;
  // accounts with an authenticator app must pass the second step first
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    return NextResponse.redirect(new URL(`/account/verify?next=${encodeURIComponent(dest)}`, url.origin));
  }
  await sb.rpc("dv_claim_account");
  return NextResponse.redirect(new URL(dest, url.origin));
}
