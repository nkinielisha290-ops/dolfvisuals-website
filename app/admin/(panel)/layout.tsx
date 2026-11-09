import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import SetupNotice from "@/components/admin/SetupNotice";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) return <SetupNotice />;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-heading text-xl font-bold">No admin access</h1>
        <p className="mt-2 text-ink/60">{user.email} is signed in but is not registered as an admin.</p>
        <form action={signOut} className="mt-6"><button className="a-btn">Sign out</button></form>
      </div>
    );
  }
  const [b, i] = await Promise.all([
    sb.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
    sb.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return (
    <div className="lg:flex">
      <AdminNav counts={{ bookings: b.count ?? 0, inquiries: i.count ?? 0 }} email={user.email ?? ""} signOut={signOut} />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
