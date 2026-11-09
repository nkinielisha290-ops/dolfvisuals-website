import type { Metadata } from "next";
import { Check, KeyRound, Mail, MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";
import { ChangePasswordForm, MfaPanel, ProfileForm, SignOutOthers } from "@/components/account/SecurityForms";
import { getPortal } from "@/lib/account";
import { getAcc } from "@/lib/i18n-account";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Settings & security", robots: { index: false } };

function Card({ icon: Icon, title, text, children }: { icon: typeof Mail; title: string; text?: string; children: React.ReactNode }) {
  return (
    <section className="reveal rounded-xl bg-ink-2 p-6 ring-1 ring-line sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold"><Icon className="size-5" /></span>
        <div><h2 className="font-heading text-xl font-bold">{title}</h2>{text && <p className="mt-1 text-sm text-white/55">{text}</p>}</div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function Settings() {
  const lang = await getLang();
  const a = getAcc(lang);
  const { client, user, mfa, providers } = await getPortal();
  if (!client) return null;
  const hasPassword = providers.includes("email");
  const last = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString(lang === "sw" ? "sw-TZ" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const methods = [
    { k: a.method_email, on: hasPassword, icon: Mail },
    { k: a.method_google, on: providers.includes("google"), icon: UserRound },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">{a.nav_settings}</h1>
        <p className="mt-2 text-white/55">{a.security_text}</p>
      </div>

      <Card icon={UserRound} title={a.profile} text={a.profile_text}><ProfileForm a={a} client={client} /></Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card icon={ShieldCheck} title={a.twofa} text={a.twofa_text}><MfaPanel a={a} factorId={mfa[0]?.id ?? null} /></Card>
        <Card icon={KeyRound} title={a.methods}>
          <ul className="divide-y divide-line">
            {methods.map(({ k, on, icon: Icon }) => (
              <li key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="flex items-center gap-3"><Icon className="size-4 text-white/50" />{k}</span>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${on ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/45"}`}>{on && <Check className="size-3" />}{on ? a.connected : a.not_set}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card icon={KeyRound} title={hasPassword ? a.change_password : a.set_password}><ChangePasswordForm a={a} hasPassword={hasPassword} /></Card>
        <Card icon={MonitorSmartphone} title={a.sessions}>
          <p className="text-sm text-white/55">{a.last_signin}</p>
          <p className="mt-1 font-display text-2xl tracking-wide">{last}</p>
          <div className="mt-6"><SignOutOthers a={a} /></div>
        </Card>
      </div>
    </div>
  );
}
