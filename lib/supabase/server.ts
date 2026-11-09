import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Session-aware client (admin pages + server actions). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — middleware refreshes the session */
        }
      },
    },
  });
}

/** Cookie-less anonymous client for public reads. */
export function supabasePublic() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}
