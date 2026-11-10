import type { Metadata } from "next";
import AuthShell from "@/components/account/AuthShell";
import { ForgotForm } from "@/components/account/AuthForms";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function Forgot() {
  const a = getAcc(await getLang());
  return <AuthShell a={a} title={a.forgot_title} text={a.forgot_text} offset={7}><ForgotForm a={a} /></AuthShell>;
}
