"use client";
import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, Copy, Loader2, LogOut, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import {
  confirmMfaEnroll, disableMfa, signOutOtherDevices, startMfaEnroll, updatePassword, updateProfile,
  type AuthState, type EnrollState,
} from "@/app/account-actions";
import type { AccDict } from "@/lib/i18n-account";
import { Err, Field, Password } from "./AuthForms";

function Saved({ text }: { text: string }) {
  return <span className="flex animate-fadeup items-center gap-2 text-sm text-gold"><CheckCircle2 className="size-4" />{text}</span>;
}

function Btn({ pending, children, ghost }: { pending: boolean; children: React.ReactNode; ghost?: boolean }) {
  return (
    <button type="submit" disabled={pending} className={`${ghost ? "btn-ghost" : "btn-gold"} !px-5 !py-2.5 !text-[0.8rem] disabled:opacity-60`}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

export function ProfileForm({ a, client }: { a: AccDict; client: { name: string; phone: string | null; email: string | null; organization: string | null; address: string | null } }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfile, null);
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={`${a.name} *`}><input name="name" required defaultValue={client.name} autoComplete="name" className="field" /></Field>
        <Field label={`${a.phone} *`}><input name="phone" type="tel" required defaultValue={client.phone ?? ""} autoComplete="tel" placeholder="+255 7XX XXX XXX" className="field" /></Field>
      </div>
      <Field label={a.email} hint={a.email_locked}><input value={client.email ?? ""} readOnly disabled className="field opacity-60" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={a.organization}><input name="organization" defaultValue={client.organization ?? ""} autoComplete="organization" className="field" /></Field>
        <Field label={a.address}><input name="address" defaultValue={client.address ?? ""} autoComplete="street-address" className="field" /></Field>
      </div>
      <Err state={state} a={a} />
      <div className="flex flex-wrap items-center gap-4"><Btn pending={pending}>{a.save}</Btn>{state?.ok && <Saved text={a.saved} />}</div>
    </form>
  );
}

export function ChangePasswordForm({ a, hasPassword }: { a: AccDict; hasPassword: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, null);
  return (
    <form action={action} className="space-y-5" key={state?.ok ? "done" : "form"}>
      {!hasPassword && <p className="text-sm text-white/55">{a.set_password_text}</p>}
      {hasPassword && <Password name="current" autoComplete="current-password" label={a.password_current} />}
      <Password name="password" autoComplete="new-password" label={a.password_new} hint={a.password_hint} meter a={a} />
      <Password name="confirm" autoComplete="new-password" label={a.password_confirm} />
      <Err state={state} a={a} />
      <div className="flex flex-wrap items-center gap-4"><Btn pending={pending}>{hasPassword ? a.change_password : a.set_password}</Btn>{state?.ok && <Saved text={a.saved} />}</div>
    </form>
  );
}

export function MfaPanel({ a, factorId }: { a: AccDict; factorId: string | null }) {
  const [enroll, setEnroll] = useState<EnrollState>(null);
  const [starting, start] = useTransition();
  const [confirmState, confirm, confirming] = useActionState<AuthState, FormData>(confirmMfaEnroll, null);
  const [offState, turnOff, turningOff] = useActionState<AuthState, FormData>(disableMfa, null);
  const [copied, setCopied] = useState(false);
  const on = Boolean(factorId) && !offState?.ok;

  if (confirmState?.ok) return <p className="flex gap-3 border-l-2 border-emerald-400 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><ShieldCheck className="size-5 shrink-0" />{a.twofa_done}</p>;

  if (on) {
    return (
      <form action={turnOff} className="flex flex-wrap items-center justify-between gap-4">
        <input type="hidden" name="factorId" value={factorId ?? ""} />
        <span className="flex items-center gap-2 text-sm text-emerald-300"><ShieldCheck className="size-5" />{a.twofa_on}</span>
        <button type="submit" disabled={turningOff} className="btn-ghost !px-4 !py-2 !text-xs">
          {turningOff ? <Loader2 className="size-4 animate-spin" /> : <ShieldOff className="size-4" />} {a.twofa_disable}
        </button>
        <Err state={offState} a={a} />
      </form>
    );
  }

  if (enroll?.ok) {
    return (
      <div className="animate-fadeup space-y-5">
        <p className="text-sm text-white/75">{a.twofa_scan}</p>
        <div className="flex flex-wrap items-center gap-6">
          {/* the QR code is an SVG data URL returned by Supabase */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="QR code" className="size-44 rounded-lg bg-white p-2" />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs text-white/50">{a.twofa_manual}</p>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(enroll.secret); setCopied(true); }}
              className="flex max-w-full items-center gap-2 break-all rounded bg-white/5 px-3 py-2 text-left font-mono text-xs tracking-wider text-gold ring-1 ring-white/10 hover:ring-gold/50">
              {enroll.secret} <Copy className="size-3.5 shrink-0" />
            </button>
            {copied && <span className="text-xs text-white/50">✓</span>}
          </div>
        </div>
        <form action={confirm} className="space-y-4">
          <input type="hidden" name="factorId" value={enroll.factorId} />
          <Field label={a.twofa_enter}>
            <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="one-time-code" className="field otp font-display !text-3xl" placeholder="••••••" />
          </Field>
          <Err state={confirmState} a={a} />
          <div className="flex flex-wrap gap-3">
            <Btn pending={confirming}>{a.twofa_confirm}</Btn>
            <button type="button" onClick={() => setEnroll(null)} className="btn-ghost !px-5 !py-2.5 !text-[0.8rem]">{a.cancel}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-white/55"><ShieldOff className="size-5" />{a.twofa_off}</span>
      <button type="button" disabled={starting} onClick={() => start(async () => setEnroll(await startMfaEnroll()))} className="btn-gold !px-5 !py-2.5 !text-[0.8rem]">
        {starting ? <Loader2 className="size-4 animate-spin" /> : <Smartphone className="size-4" />} {a.twofa_enable}
      </button>
      {enroll && !enroll.ok && <Err state={enroll} a={a} />}
    </div>
  );
}

export function SignOutOthers({ a }: { a: AccDict }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signOutOtherDevices, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-4">
      <Btn pending={pending} ghost><LogOut className="size-4" /> {a.signout_others}</Btn>
      {state?.ok && <Saved text={a.signed_out_others} />}
      <Err state={state} a={a} />
    </form>
  );
}
