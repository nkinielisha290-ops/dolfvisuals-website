import type { Metadata } from "next";
import AuthShell from "@/components/account/AuthShell";
import { ResetForm } from "@/components/account/AuthForms";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default async function Reset() {
  const a = getAcc(await getLang());
  return <AuthShell a={a} title={a.reset_title} text={a.password_hint} offset={7}><ResetForm a={a} /></AuthShell>;
}
