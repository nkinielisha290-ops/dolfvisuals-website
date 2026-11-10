"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Mail, MailCheck, ShieldCheck } from "lucide-react";
import {
  requestPasswordReset, resendVerification, sendMagicLink, signInClient, signInWithGoogle, signUpClient,
  updatePassword, verifyMfaSignIn, type AuthState,
} from "@/app/account-actions";
import type { AccDict } from "@/lib/i18n-account";

/* ---------- building blocks ---------- */

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-white/40">{hint}</span>}
    </label>
  );
}

/** 0–4 score: length, letters + numbers, mixed case, symbols. */
export function scorePassword(pw: string) {
  if (pw.length < 8) return 0;
  let s = 1;
  if (/[a-zA-Z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw) || pw.length >= 14) s++;
  return Math.min(4, s);
}

export function Password({ name, autoComplete, label, hint, meter, a }: {
  name: string; autoComplete: string; label: string; hint?: string; meter?: boolean; a?: AccDict;
}) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  const score = scorePassword(val);
  const colors = ["bg-red-500", "bg-red-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"];
  return (
    <Field label={label} hint={meter && a && val ? undefined : hint}>
      <span className="relative block">
        <input name={name} type={show ? "text" : "password"} required minLength={autoComplete === "current-password" ? undefined : 8}
          autoComplete={autoComplete} value={val} onChange={(e) => setVal(e.target.value)} className="field pr-12" />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-white/40 transition hover:text-gold">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
      {meter && a && val && (
        <span className="mt-2 flex items-center gap-3" aria-live="polite">
          <span className="grid flex-1 grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((n) => <span key={n} className={`h-1 transition-colors duration-300 ${score >= n ? colors[score] : "bg-[#fff]/10"}`} />)}
          </span>
          <span className="w-20 text-right text-xs text-white/55">{a.strength[score]}</span>
        </span>
      )}
    </Field>
  );
}

const ERR: Record<string, keyof AccDict> = {
  invalid: "err_invalid", unconfirmed: "err_unconfirmed", exists: "err_exists", password: "err_password", weak: "err_weak",
  pwned: "err_pwned", match: "err_match", required: "err_required", generic: "err_generic", rate: "err_rate",
  captcha: "err_captcha", current: "err_current", code: "err_code", phone: "err_phone",
};

export function Err({ state, a }: { state: AuthState; a: AccDict }) {
  if (!state || state.ok) return null;
  return <p role="alert" className="animate-fadeup border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-300">{a[ERR[state.error] ?? "err_generic"] as string}</p>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="flex animate-fadeup gap-3 border-l-2 border-gold bg-gold/10 px-4 py-3.5 text-sm text-white/85"><MailCheck className="size-5 shrink-0 text-gold" /><span>{children}</span></p>;
}

export function Submit({ pending, children, className = "" }: { pending: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={`btn-gold w-full justify-center disabled:opacity-60 ${className}`}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <>{children} <ArrowRight className="size-4" /></>}
    </button>
  );
}

/** Cloudflare Turnstile bot check — only rendered when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
declare global { interface Window { turnstile?: { render: (el: HTMLElement, o: object) => string; reset: (id?: string) => void } } }
function Captcha({ resetKey }: { resetKey: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const mount = () => { if (window.turnstile && ref.current && !id.current) id.current = window.turnstile.render(ref.current, { sitekey: SITE_KEY, theme: "auto" }); };
    if (window.turnstile) mount();
    else if (!document.getElementById("cf-turnstile")) {
      const sc = Object.assign(document.createElement("script"), { id: "cf-turnstile", src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", async: true });
      sc.onload = mount;
      document.head.appendChild(sc);
    } else document.getElementById("cf-turnstile")!.addEventListener("load", mount);
  }, []);
  useEffect(() => { if (id.current) window.turnstile?.reset(id.current); }, [resetKey]);
  if (!SITE_KEY) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}

/* ---------- Google ---------- */

function GooglePending({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#fff] px-5 py-3.5 font-sub text-sm font-semibold text-[#1f1f1f] shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70">
      {pending ? <Loader2 className="size-5 animate-spin" /> : (
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
      )}
      {label}
    </button>
  );
}

export function GoogleButton({ a, next }: { a: AccDict; next?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next ?? ""} />
      <GooglePending label={a.continue_google} />
    </form>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-7 flex items-center gap-4 font-sub text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
      <span className="h-px flex-1 bg-[#fff]/10" />{label}<span className="h-px flex-1 bg-[#fff]/10" />
    </div>
  );
}

/* ---------- sign in ---------- */

function ResendBox({ a, email }: { a: AccDict; email?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resendVerification, null);
  if (state?.ok) return <Notice>{a.resent}</Notice>;
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="email" value={email ?? ""} />
      <button type="submit" disabled={pending} className="btn-ghost !px-4 !py-2 !text-xs">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} {a.resend}
      </button>
      <Err state={state} a={a} />
    </form>
  );
}

function MagicLinkForm({ a, next, onBack }: { a: AccDict; next?: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(sendMagicLink, null);
  return (
    <div className="animate-fadeup space-y-5">
      <div>
        <p className="font-heading text-lg font-bold">{a.magic_title}</p>
        <p className="mt-1 text-sm text-white/55">{a.magic_text}</p>
      </div>
      {state?.ok ? <Notice>{a.link_sent.replace("{email}", state.email ?? "")}</Notice> : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="next" value={next ?? ""} />
          <Field label={a.email}><input name="email" type="email" required autoComplete="email" className="field" /></Field>
          <Captcha resetKey={state} />
          <Err state={state} a={a} />
          <Submit pending={pending}>{a.send_magic}</Submit>
        </form>
      )}
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-white/60 hover:text-gold"><KeyRound className="size-4" /> {a.use_password}</button>
    </div>
  );
}

export function LoginForm({ a, next, notice }: { a: AccDict; next?: string; notice?: "link" | "expired" | "google" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInClient, null);
  const [magic, setMagic] = useState(false);
  const banner = notice === "google" ? a.err_google : notice ? a.err_expired : null;
  return (
    <div>
      {banner && !state && <p role="alert" className="mb-6 border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-300">{banner}</p>}
      <GoogleButton a={a} next={next} />
      <Divider label={a.or_email} />
      {magic ? <MagicLinkForm a={a} next={next} onBack={() => setMagic(false)} /> : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="next" value={next ?? ""} />
          <Field label={a.email}><input name="email" type="email" required autoComplete="email" defaultValue={state && !state.ok ? state.email : undefined} className="field" /></Field>
          <Password name="password" autoComplete="current-password" label={a.password} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <button type="button" onClick={() => setMagic(true)} className="flex items-center gap-2 text-white/60 hover:text-gold"><Mail className="size-4" /> {a.magic_link}</button>
            <Link href="/account/forgot" className="u-link text-white/60 hover:text-gold">{a.forgot}</Link>
          </div>
          <Captcha resetKey={state} />
          <Err state={state} a={a} />
          {state && !state.ok && state.error === "unconfirmed" && <ResendBox a={a} email={state.email} />}
          <Submit pending={pending}>{a.sign_in}</Submit>
        </form>
      )}
    </div>
  );
}

/* ---------- sign up ---------- */

function CheckEmail({ a, email }: { a: AccDict; email?: string }) {
  return (
    <div className="animate-fadeup text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-full border border-gold/40 bg-gold/10"><MailCheck className="size-9 text-gold" /></span>
      <h2 className="mt-6 font-heading text-2xl font-bold">{a.check_email_title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-white/60">{a.check_email_text.replace("{email}", email ?? "")}</p>
      <div className="mt-6 flex justify-center"><ResendBox a={a} email={email} /></div>
      <Link href="/account/login" className="mt-6 inline-block text-sm text-gold hover:underline">{a.back_to_login}</Link>
    </div>
  );
}

export function RegisterForm({ a }: { a: AccDict }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUpClient, null);
  if (state?.ok && state.message === "check_email") return <CheckEmail a={a} email={state.email} />;
  return (
    <div>
      <GoogleButton a={a} />
      <Divider label={a.or_email} />
      <form action={action} className="space-y-5">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <Field label={`${a.name} *`}><input name="name" required autoComplete="name" className="field" /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={`${a.phone} *`}><input name="phone" type="tel" required autoComplete="tel" placeholder="+255 7XX XXX XXX" className="field" /></Field>
          <Field label={`${a.email} *`}><input name="email" type="email" required autoComplete="email" className="field" /></Field>
        </div>
        <Password name="password" autoComplete="new-password" label={`${a.password} *`} hint={a.password_hint} meter a={a} />
        <Password name="confirm" autoComplete="new-password" label={`${a.password_confirm} *`} />
        <Captcha resetKey={state} />
        <Err state={state} a={a} />
        <Submit pending={pending}>{a.register}</Submit>
        <p className="text-center text-xs text-white/40">{a.terms}</p>
      </form>
    </div>
  );
}

/* ---------- recovery & second step ---------- */

export function ForgotForm({ a }: { a: AccDict }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, null);
  if (state?.ok) {
    return (
      <div className="space-y-6">
        <Notice>{a.reset_sent}</Notice>
        <Link href="/account/login" className="btn-ghost inline-flex">{a.back_to_login}</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5">
      <Field label={a.email}><input name="email" type="email" required autoComplete="email" className="field" /></Field>
      <Captcha resetKey={state} />
      <Err state={state} a={a} />
      <Submit pending={pending}>{a.send_link}</Submit>
      <p className="text-center text-sm"><Link href="/account/login" className="u-link text-white/60 hover:text-gold">{a.back_to_login}</Link></p>
    </form>
  );
}

export function ResetForm({ a }: { a: AccDict }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, null);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="from" value="reset" />
      <Password name="password" autoComplete="new-password" label={a.password_new} hint={a.password_hint} meter a={a} />
      <Password name="confirm" autoComplete="new-password" label={a.password_confirm} />
      <Err state={state} a={a} />
      <Submit pending={pending}>{a.save_password}</Submit>
    </form>
  );
}

export function VerifyForm({ a, next }: { a: AccDict; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(verifyMfaSignIn, null);
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="flex justify-center"><span className="grid size-16 place-items-center rounded-full border border-gold/40 bg-gold/10"><ShieldCheck className="size-8 text-gold" /></span></div>
      <Field label={a.code}>
        <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="one-time-code" autoFocus
          className="field otp font-display !text-4xl" placeholder="••••••" />
      </Field>
      <Err state={state} a={a} />
      <Submit pending={pending}>{a.verify_btn}</Submit>
    </form>
  );
}


