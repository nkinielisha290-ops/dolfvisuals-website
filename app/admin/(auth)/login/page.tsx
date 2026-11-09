import LoginForm from "@/components/admin/LoginForm";
import SetupNotice from "@/components/admin/SetupNotice";
import { hasSupabase } from "@/lib/supabase/config";

export default function Login() {
  if (!hasSupabase) return <SetupNotice />;
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-ink/10 bg-white p-8 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-black.svg" alt="DOLF VISUALS" className="h-9" />
        <p className="mt-6 text-sm text-ink/60">Admin dashboard</p>
        <LoginForm />
      </div>
    </div>
  );
}
