import SettingsForm from "@/components/admin/SettingsForm";
import { PageTitle } from "@/components/admin/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { seedSettings } from "@/lib/seed";
import type { Settings } from "@/lib/types";

export default async function SettingsPage() {
  const sb = await supabaseServer();
  const { data } = await sb.from("dv_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageTitle title="Settings" text="Headline, contact details and social links shown across the website." />
      <SettingsForm settings={{ ...seedSettings, ...(data ?? {}) } as Settings} />
    </>
  );
}
