"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import {
  requestPasswordReset, signInClient, signUpClient, updatePassword, updateProfile, type AuthState,
} from "@/app/account-actions";
import type { AccDict } from "@/lib/i18n-account";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-white/40">{hint}</span>}
    </label>
  );
}

function Password({ name, autoComplete, label, hint }: { name: string; autoComplete: string; label: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <span className="relative block">
        <input name={name} type={show ? "text" : "password"} required minLength={name === "password" && autoComplete === "current-password" ? undefined : 8}
          autoComplete={autoComplete} className="field pr-12" />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-white/40 transition hover:text-gold">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
    </Field>
  );
}

function Err({ state, a }: { state: AuthState; a: AccDict }) {
  if (!state || state.ok) return null;
  const msg = { invalid: a.err_invalid, unconfirmed: a.err_unconfirmed, exists: a.err_exists, password: a.err_password,
    match: a.err_match, required: a.err_required, generic: a.err_generic, rate: a.err_rate }[state.error];
  return <p role="alert" className="border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-300">{msg}</p>;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="btn-gold w-full justify-center disabled:opacity-60">
      {pending ? <Loader2 className="size-4 animate-spin" /> : <>{children} <ArrowRight className="size-4" /></>}
    </button>
  );
}

const honeypot = <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />;

export function LoginForm({ a, next, linkError }: { a: AccDict; next?: string; linkError?: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInClient, null);
  return (
    <form action={action} className="space-y-5">
      {linkError && !state && <p role="alert" className="border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-300">{a.err_link}</p>}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label={a.email}><input name="email" type="email" required autoComplete="email" className="field" /></Field>
      <Password name="password" autoComplete="current-password" label={a.password} />
      <div className="flex justify-end"><Link href="/account/forgot" className="u-link text-sm text-white/60 hover:text-gold">{a.forgot}</Link></div>
      <Err state={state} a={a} />
      <Submit pending={pending}>{a.sign_in}</Submit>
      <p className="pt-2 text-center text-sm text-white/55">
        {a.no_account} <Link href="/account/register" className="font-semibold text-gold hover:underline">{a.register}</Link>
      </p>
    </form>
  );
}

function CheckEmail({ a, email }: { a: AccDict; email?: string }) {
  return (
    <div className="animate-fadeup text-center">
      <MailCheck className="mx-auto size-12 text-gold" />
      <h2 className="mt-5 font-heading text-2xl font-bold">{a.check_email_title}</h2>
      <p className="mt-3 text-white/60">{a.check_email_text.replace("{email}", email ?? "")}</p>
      <Link href="/account/login" className="btn-ghost mt-8 inline-flex">{a.back_to_login}</Link>
    </div>
  );
}

export function RegisterForm({ a }: { a: AccDict }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUpClient, null);
  if (state?.ok && state.message === "check_email") return <CheckEmail a={a} email={state.email} />;
  return (
    <form action={action} className="space-y-5">
      {honeypot}
      <Field label={`${a.name} *`}><input name="name" required autoComplete="name" className="field" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={`${a.phone} *`}><input name="phone" type="tel" required autoComplete="tel" placeholder="+255 7XX XXX XXX" className="field" /></Field>
        <Field label={`${a.email} *`}><input name="email" type="email" required autoComplete="email" className="field" /></Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Password name="password" autoComplete="new-password" label={`${a.password} *`} hint={a.password_hint} />
        <Password name="confirm" autoComplete="new-password" label={`${a.password_confirm} *`} />
      </div>
      <Err state={state} a={a} />
      <Submit pending={pending}>{a.register}</Submit>
      <p className="text-center text-xs text-white/40">{a.terms}</p>
      <p className="text-center text-sm text-white/55">
        {a.have_account} <Link href="/account/login" className="font-semibold text-gold hover:underline">{a.sign_in}</Link>
      </p>
    </form>
  );
}

export function ForgotForm({ a }: { a: AccDict }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, null);
  if (state?.ok) {
    return (
      <div className="animate-fadeup">
        <p className="flex gap-3 border-l-2 border-gold bg-gold/10 px-4 py-4 text-sm text-white/80"><MailCheck className="size-5 shrink-0 text-gold" />{a.reset_sent}</p>
        <Link href="/account/login" className="btn-ghost mt-8 inline-flex">{a.back_to_login}</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5">
      <Field label={a.email}><input name="email" type="email" required autoComplete="email" className="field" /></Field>
      <Err state={state} a={a} />
      <Submit pending={pending}>{a.send_link}</Submit>
      <p className="text-center text-sm"><Link href="/account/login" className="u-link text-white/60 hover:text-gold">{a.back_to_login}</Link></p>
    </form>
  );
}

export function PasswordForm({ a, from }: { a: AccDict; from?: "reset" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, null);
  return (
    <form action={action} className="space-y-5">
      {from && <input type="hidden" name="from" value={from} />}
      <Password name="password" autoComplete="new-password" label={a.password_new} hint={a.password_hint} />
      <Password name="confirm" autoComplete="new-password" label={a.password_confirm} />
      <Err state={state} a={a} />
      {state?.ok && <p className="flex items-center gap-2 text-sm text-gold"><CheckCircle2 className="size-4" />{a.saved}</p>}
      <Submit pending={pending}>{from ? a.save_password : a.change_password}</Submit>
    </form>
  );
}

export function ProfileForm({ a, client }: { a: AccDict; client: { name: string; phone: string | null; email: string | null; organization: string | null; address: string | null } }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfile, null);
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={`${a.name} *`}><input name="name" required defaultValue={client.name} autoComplete="name" className="field" /></Field>
        <Field label={`${a.phone} *`}><input name="phone" type="tel" required defaultValue={client.phone ?? ""} autoComplete="tel" className="field" /></Field>
        <Field label={a.email}><input value={client.email ?? ""} readOnly disabled className="field opacity-60" /></Field>
        <Field label={a.organization}><input name="organization" defaultValue={client.organization ?? ""} autoComplete="organization" className="field" /></Field>
      </div>
      <Field label={a.address}><input name="address" defaultValue={client.address ?? ""} autoComplete="street-address" className="field" /></Field>
      <Err state={state} a={a} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn-gold disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : a.save}
        </button>
        {state?.ok && <span className="flex items-center gap-2 text-sm text-gold"><CheckCircle2 className="size-4" />{a.saved}</span>}
      </div>
    </form>
  );
}
