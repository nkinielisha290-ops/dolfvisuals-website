"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, RotateCcw, SendHorizontal, X } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcons";
import { answer, chatText, detectIntent, waHref, welcome, type ChatAction, type ChatKB, type ChatReply } from "@/lib/chatbot";

type Msg = { id: number; from: "bot" | "me"; text: string; actions?: ChatAction[]; chips?: string[] };

const UI = {
  en: { open: "Chat with us", close: "Close chat", title: "DOLF Assistant", status: "Online · replies instantly", placeholder: "Type your question…", send: "Send", restart: "Start over", human: "Prefer a person? WhatsApp us", teaser: "Hi! Need help planning your shoot?" },
  sw: { open: "Ongea nasi", close: "Funga chat", title: "Msaidizi wa DOLF", status: "Yupo · anajibu papo hapo", placeholder: "Andika swali lako…", send: "Tuma", restart: "Anza upya", human: "Unapendelea mtu? Tuandikie WhatsApp", teaser: "Habari! Unahitaji msaada kupanga shoot yako?" },
};

/** Render **bold** and line breaks without dangerouslySetInnerHTML. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block min-h-[0.6em]">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong> : part,
          )}
        </span>
      ))}
    </>
  );
}

export default function ChatWidget({ kb, ai }: { kb: ChatKB; ai: boolean }) {
  const ui = UI[kb.lang] ?? UI.en;
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (m: Omit<Msg, "id">) => setMsgs((list) => [...list, { ...m, id: idRef.current++ }]);

  // first open: greeting
  useEffect(() => {
    if (open && msgs.length === 0) push({ from: "bot", ...welcome(kb) });
    if (open) { setTeaser(false); try { sessionStorage.setItem("dv-chat-seen", "1"); } catch { /* ignore */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // gentle teaser bubble once per session
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("dv-chat-seen") === "1"; } catch { /* ignore */ }
    if (seen) return;
    const a = setTimeout(() => setTeaser(true), 9000);
    const b = setTimeout(() => setTeaser(false), 21000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    if (window.matchMedia("(min-width: 640px)").matches) setTimeout(() => inputRef.current?.focus(), 250);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(text: string) {
    const q = text.trim().slice(0, 500);
    if (!q || typing) return;
    setInput("");
    const history = [...msgs, { id: 0, from: "me" as const, text: q }];
    push({ from: "me", text: q });
    setTyping(true);

    let reply: ChatReply = answer(q, kb);
    // Built-in answers for known questions; the AI (when switched on) handles the rest.
    if (ai && detectIntent(q) === "fallback" && reply.text === chatText(kb.lang).fallback) {
      try {
        const r = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lang: kb.lang,
            messages: history.filter((m) => m.text).map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text })),
          }),
        });
        if (r.ok) {
          const { text: t } = (await r.json()) as { text?: string };
          if (t) reply = { text: t, actions: [{ label: chatText(kb.lang).btn_book, href: "/booking" }, { label: chatText(kb.lang).btn_wa, href: waHref(kb, q), external: true }] };
        }
      } catch { /* keep the built-in reply */ }
    } else {
      await new Promise((res) => setTimeout(res, 450 + Math.min(900, reply.text.length * 6)));
    }
    setTyping(false);
    push({ from: "bot", ...reply });
  }

  const restart = () => { setMsgs([]); idRef.current = 1; setTimeout(() => push({ from: "bot", ...welcome(kb) }), 0); };
  const last = msgs[msgs.length - 1];

  return (
    <div className="theme-dark">
      {/* launcher */}
      <div className="fixed bottom-5 left-5 z-40 flex items-end gap-3">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? ui.close : ui.open} aria-expanded={open} aria-controls="dv-chat"
          className="group relative grid size-14 place-items-center rounded-full bg-gold text-on-gold shadow-lg shadow-black/40 transition hover:scale-105">
          {!open && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-gold/40 [animation-duration:2.6s]" />}
          <span className="relative">{open ? <X className="size-6" /> : <MessageCircle className="size-6" />}</span>
        </button>
        {teaser && !open && (
          <button type="button" onClick={() => setOpen(true)}
            className="mb-2 hidden max-w-56 animate-fadeup rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-left text-sm font-medium text-[#111] shadow-xl sm:block">
            {ui.teaser}
          </button>
        )}
      </div>

      {/* panel */}
      <section id="dv-chat" role="dialog" aria-label={ui.title} aria-hidden={!open}
        className={`fixed z-[45] flex flex-col overflow-hidden border border-white/10 bg-[#121212] text-white shadow-2xl shadow-black/60 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]
          inset-x-3 bottom-24 top-24 rounded-2xl sm:inset-x-auto sm:left-5 sm:top-auto sm:h-[min(620px,calc(100svh-8rem))] sm:w-[400px]
          ${open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-6 opacity-0"}`}>
        <header className="relative flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#1c1c1c] to-[#121212] px-5 py-4">
          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
          <span className="relative grid size-11 place-items-center rounded-full bg-black ring-1 ring-gold/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icon-gold.svg" alt="" className="size-6" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#121212] bg-emerald-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading font-bold leading-tight">{ui.title}</p>
            <p className="text-xs text-white/50">{ui.status}</p>
          </div>
          <button type="button" onClick={restart} aria-label={ui.restart} title={ui.restart} className="grid size-9 place-items-center rounded-full text-white/50 transition hover:bg-white/5 hover:text-gold">
            <RotateCcw className="size-4" />
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label={ui.close} className="grid size-9 place-items-center rounded-full text-white/50 transition hover:bg-white/5 hover:text-white">
            <X className="size-5" />
          </button>
        </header>

        <div ref={listRef} data-lenis-prevent className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
          {msgs.map((m) => (
            <div key={m.id} className={`flex animate-fadeup [animation-duration:.35s] ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[86%] ${m.from === "me" ? "rounded-2xl rounded-br-sm bg-gold px-4 py-2.5 text-sm text-[#111]" : ""}`}>
                {m.from === "me" ? m.text : (
                  <>
                    <div className="rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-3 text-sm leading-relaxed text-white/85"><Rich text={m.text} /></div>
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.actions.map((a) => {
                          const cls = "inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold hover:text-[#111]";
                          const icon = a.href.startsWith("https://wa.me") ? <SocialIcon name="whatsapp" className="size-3.5" /> : <ArrowUpRight className="size-3.5" />;
                          return a.external
                            ? <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>{icon}{a.label}</a>
                            : <Link key={a.label} href={a.href} onClick={() => setOpen(false)} className={cls}>{icon}{a.label}</Link>;
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex" aria-label="…">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-3.5">
                {[0, 1, 2].map((d) => <span key={d} className="size-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            </div>
          )}
          {!typing && last?.from === "bot" && last.chips && (
            <div className="flex flex-wrap gap-2 pt-1">
              {last.chips.map((c) => (
                <button key={c} type="button" onClick={() => ask(c)}
                  className="rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/80 transition hover:border-gold hover:text-gold">
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1.5 pl-4 pr-1.5 focus-within:border-gold/60">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={ui.placeholder} maxLength={500}
              aria-label={ui.placeholder} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
            <button type="submit" disabled={!input.trim() || typing} aria-label={ui.send}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-[#111] transition disabled:opacity-30">
              <SendHorizontal className="size-4" />
            </button>
          </div>
          <a href={waHref(kb)} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-1.5 text-[0.7rem] text-white/45 transition hover:text-[#25D366]">
            <SocialIcon name="whatsapp" className="size-3.5" /> {ui.human}
          </a>
        </form>
      </section>
    </div>
  );
}
