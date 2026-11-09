import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && path !== "/admin/login" && !data.user) {
    const to = request.nextUrl.clone();
    to.pathname = "/admin/login";
    return NextResponse.redirect(to);
  }
  // client portal: everything under /account needs a session except the sign-in / sign-up pages
  const go = (pathname: string, search = "") => {
    const to = request.nextUrl.clone();
    to.pathname = pathname;
    to.search = search;
    const r = NextResponse.redirect(to);
    response.cookies.getAll().forEach((c) => r.cookies.set(c)); // keep refreshed session cookies
    return r;
  };
  const open = ["/account/login", "/account/register", "/account/forgot"];
  const portal = path === "/account" || path.startsWith("/account/") || path.startsWith("/invoice/");
  if (portal && !open.includes(path) && !data.user) return go("/account/login", `?next=${encodeURIComponent(path)}`);
  if (portal && data.user && path !== "/account/verify") {
    // second step (authenticator app) still pending → ask for the code before anything else
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") return go("/account/verify", `?next=${encodeURIComponent(open.includes(path) ? "/account" : path)}`);
    if (path === "/account/login" || path === "/account/register") return go("/account");
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/account", "/account/:path*", "/invoice/:path*", "/auth/:path*"] };
