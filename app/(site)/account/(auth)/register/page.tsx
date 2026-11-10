import type { Metadata } from "next";
import AuthShell from "@/components/account/AuthShell";
import { RegisterForm } from "@/components/account/AuthForms";
import NotConfigured from "@/components/account/NotConfigured";
import { getDict } from "@/lib/i18n";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";
import { getSettings } from "@/lib/data";
import { hasSupabase } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create an account", description: "Create your DOLF VISUALS client account to track bookings, invoices and deliveries." };

export default async function Register() {
  const lang = await getLang();
  const a = getAcc(lang);
  const settings = await getSettings();
  return (
    <AuthShell a={a} tab="register" title={a.register_title} text={a.register_text} offset={4}>
      {hasSupabase ? <RegisterForm a={a} /> : <NotConfigured a={a} whatsapp={settings.whatsapp} bookLabel={getDict(lang).nav_book} />}
    </AuthShell>
  );
}
