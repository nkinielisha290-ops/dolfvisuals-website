import type { Metadata } from "next";
import { signOutClient } from "@/app/account-actions";
import AuthShell from "@/components/account/AuthShell";
import { VerifyForm } from "@/components/account/AuthForms";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Two-step verification", robots: { index: false } };

export default async function Verify({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const a = getAcc(await getLang());
  return (
    <AuthShell a={a} title={a.verify_title} text={a.verify_text}>
      <VerifyForm a={a} next={next} />
      <form action={signOutClient} className="mt-6 text-center">
        <button type="submit" className="text-sm text-white/50 hover:text-gold">{a.sign_out}</button>
      </form>
    </AuthShell>
  );
}
