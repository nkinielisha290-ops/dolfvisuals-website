"use client";
import { useActionState, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { submitBooking, submitInquiry, type FormState } from "@/app/actions";
import { SocialIcon } from "./SocialIcons";
import type { Dict } from "@/lib/i18n";

function waHref(number: string, text?: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}

function Done({ t, whatsapp, summary, reference, reset }: { t: Dict; whatsapp: string; summary?: string; reference?: string; reset: () => void }) {
  return (
    <div className="animate-fadeup border border-gold/30 bg-ink-2 p-8 sm:p-10">
      <CheckCircle2 className="size-10 text-gold" />
      <h3 className="mt-5 font-heading text-2xl font-bold">{t.sent_title}</h3>
      {reference && (
        <div className="mt-6 inline-block border border-gold/40 px-5 py-4">
          <p className="label">{t.ref_label}</p>
          <p className="mt-1 font-display text-4xl tracking-[0.12em] text-gold">{reference}</p>
          <p className="mt-1 text-xs text-white/50">{t.ref_hint}</p>
        </div>
      )}
      <p className="mt-5 text-white/60">{t.sent_text}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={waHref(whatsapp, summary)} target="_blank" rel="noopener noreferrer" className="btn-gold">
          <SocialIcon name="whatsapp" className="size-4" /> {t.sent_wa}
        </a>
        <button type="button" onClick={reset} className="btn-ghost">{t.sent_again}</button>
      </div>
    </div>
  );
}

function ErrorLine({ state, t }: { state: FormState; t: Dict }) {
  if (!state || state.ok) return null;
  return <p role="alert" className="text-sm text-red-400">{state.error === "required" ? t.err_required : t.err_generic}</p>;
}

const honeypot = <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />;

type Contact = { name?: string; phone?: string; email?: string };

export function BookingForm({ t, services, whatsapp, defaultService, defaultKind = "booking", contact }: {
  t: Dict; services: { slug: string; title: string }[]; whatsapp: string; defaultService?: string; defaultKind?: "booking" | "quote"; contact?: Contact;
}) {
  const [key, setKey] = useState(0);
  return <BookingInner key={key} t={t} services={services} whatsapp={whatsapp} defaultService={defaultService} defaultKind={defaultKind} contact={contact} reset={() => setKey((k) => k + 1)} />;
}

function BookingInner({ t, services, whatsapp, defaultService, defaultKind, contact, reset }: {
  t: Dict; services: { slug: string; title: string }[]; whatsapp: string; defaultService?: string; defaultKind: "booking" | "quote"; contact?: Contact; reset: () => void;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitBooking, null);
  const [kind, setKind] = useState<"booking" | "quote">(defaultKind);
  if (state?.ok) return <Done t={t} whatsapp={whatsapp} summary={state.summary} reference={state.reference} reset={reset} />;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="grid gap-8 sm:grid-cols-2">
      {honeypot}
      <input type="hidden" name="request_type" value={kind} />
      <div role="radiogroup" aria-label={t.f_service} className="flex flex-wrap gap-2 sm:col-span-2">
        {(["booking", "quote"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
            className={`border px-5 py-3 font-sub text-sm transition ${kind === k ? "border-gold bg-gold text-on-gold" : "border-white/20 text-white/70 hover:border-gold hover:text-white"}`}>
            {k === "booking" ? t.req_booking : t.req_quote}
          </button>
        ))}
      </div>
      <Field label={`${t.f_name} *`}><input name="name" required autoComplete="name" defaultValue={contact?.name} className="field" /></Field>
      <Field label={`${t.f_phone} *`}><input name="phone" required type="tel" autoComplete="tel" placeholder="+255" defaultValue={contact?.phone} className="field" /></Field>
      <Field label={t.f_email}><input name="email" type="email" autoComplete="email" defaultValue={contact?.email} className="field" /></Field>
      <Field label={t.f_service}>
        <select name="service" defaultValue={defaultService ?? ""} className="field">
          <option value="">{t.f_choose}</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
      </Field>
      <Field label={t.f_date}><input name="event_date" type="date" min={today} className="field [color-scheme:dark]" /></Field>
      <Field label={t.f_location}><input name="location" className="field" /></Field>
      <Field label={t.f_guests}><input name="guests" className="field" /></Field>
      <Field label={t.f_budget}><input name="budget" placeholder="TSh" className="field" /></Field>
      <div className="sm:col-span-2">
        <Field label={t.f_details}><textarea name="details" rows={4} className="field resize-y" /></Field>
      </div>
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-gold disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} {kind === "quote" ? t.f_submit_quote : t.f_submit}
        </button>
        <ErrorLine state={state} t={t} />
      </div>
    </form>
  );
}

export function ContactForm({ t, whatsapp }: { t: Dict; whatsapp: string }) {
  const [key, setKey] = useState(0);
  return <ContactInner key={key} t={t} whatsapp={whatsapp} reset={() => setKey((k) => k + 1)} />;
}

function ContactInner({ t, whatsapp, reset }: { t: Dict; whatsapp: string; reset: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitInquiry, null);
  if (state?.ok) return <Done t={t} whatsapp={whatsapp} summary={state.summary} reset={reset} />;
  return (
    <form action={action} className="grid gap-8 sm:grid-cols-2">
      {honeypot}
      <Field label={`${t.f_name} *`}><input name="name" required autoComplete="name" className="field" /></Field>
      <Field label={`${t.f_phone} *`}><input name="phone" type="tel" autoComplete="tel" placeholder="+255" className="field" /></Field>
      <Field label={t.f_email}><input name="email" type="email" autoComplete="email" className="field" /></Field>
      <Field label={t.f_subject}><input name="subject" className="field" /></Field>
      <div className="sm:col-span-2"><Field label={`${t.f_message} *`}><textarea name="message" required rows={5} className="field resize-y" /></Field></div>
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-gold disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} {t.f_send}
        </button>
        <ErrorLine state={state} t={t} />
      </div>
    </form>
  );
}
