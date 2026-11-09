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
  const open = ["/account/login", "/account/register", "/account/forgot"];
  if ((path === "/account" || path.startsWith("/account/") || path.startsWith("/invoice/")) && !open.includes(path) && !data.user) {
    const to = request.nextUrl.clone();
    to.pathname = "/account/login";
    to.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(to);
  }
  if ((path === "/account/login" || path === "/account/register") && data.user) {
    const to = request.nextUrl.clone();
    to.pathname = "/account";
    to.search = "";
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/account", "/account/:path*", "/invoice/:path*", "/auth/:path*"] };
