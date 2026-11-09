import type { Metadata } from "next";
import AuthShell from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/AuthForms";
import NotConfigured from "@/components/account/NotConfigured";
import { getDict } from "@/lib/i18n";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";
import { getSettings } from "@/lib/data";
import { hasSupabase } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Client sign in", robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const lang = await getLang();
  const a = getAcc(lang);
  const settings = await getSettings();
  const notice = error === "google" ? "google" : error === "expired" ? "expired" : error ? "link" : undefined;
  return (
    <AuthShell a={a} tab="signin" title={a.login_title} text={a.login_text}>
      {hasSupabase ? <LoginForm a={a} next={next} notice={notice} /> : <NotConfigured a={a} whatsapp={settings.whatsapp} bookLabel={getDict(lang).nav_book} />}
    </AuthShell>
  );
}
