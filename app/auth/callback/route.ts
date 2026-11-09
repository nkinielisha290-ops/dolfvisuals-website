import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

/** Landing point for email links (account confirmation, password reset). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const raw = url.searchParams.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  const fail = new URL("/account/login?error=link", url.origin);
  if (!hasSupabase) return NextResponse.redirect(fail);

  const sb = await supabaseServer();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await sb.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  if (error) return NextResponse.redirect(fail);
  return NextResponse.redirect(new URL(type === "recovery" ? "/account/reset" : next, url.origin));
}
