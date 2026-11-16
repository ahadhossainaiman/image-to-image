import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clock3, Gem, MessageCircle, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Bespoke Inquiry — Thy House Of Art" },
    { name: "description", content: "Begin a private conversation about acquiring an artwork or commissioning a singular piece from Thy House Of Art." },
    { property: "og:title", content: "Bespoke Inquiry — Thy House Of Art" },
    { property: "og:description", content: "Share your vision with the atelier and begin a bespoke artwork conversation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Contact,
});

export function Contact() {
  const search: Record<string, unknown> = useSearch({ strict: false });
  const piece = typeof search["piece"] === "string" ? search["piece"] : undefined;
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const rawDraft = window.localStorage.getItem("thoa-inquiry-draft");
    if (!rawDraft) return;
    try {
      const draft = JSON.parse(rawDraft) as Record<string, unknown>;
      for (const [name, value] of Object.entries(draft)) {
        if (name === "piece" && piece) continue;
        const field = formRef.current?.querySelector(`[name="${name}"]`);
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
          field.value = field instanceof HTMLTextAreaElement && field.maxLength > 0
            ? String(value).slice(0, field.maxLength)
            : String(value);
        }
      }
      setSaved(true);
    } catch {
      window.localStorage.removeItem("thoa-inquiry-draft");
    }
  }, [piece]);

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    window.localStorage.setItem("thoa-inquiry-draft", JSON.stringify({ ...values, savedAt: new Date().toISOString() }));
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-16 sm:px-10 lg:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <div className="botanical-rule mx-auto w-fit eyebrow">Private commissions</div>
        <h1 className="mt-6 text-6xl leading-[.95] sm:text-7xl">Let us imagine<br /><em className="text-accent">something together.</em></h1>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-muted-foreground">Tell us about the artwork that caught your eye, your space, or the story you would like us to bring to life.</p>
      </header>
      <div className="mt-16 grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <aside className="glass-panel h-fit p-8 sm:p-10">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={1} />
          <h2 className="mt-6 text-4xl">A personal beginning</h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">Every bespoke work starts with listening. Your ideas, preferred materials, scale and sense of wonder guide the conversation.</p>
          <div className="mt-8 space-y-6 border-t border-border pt-7">
            <div className="flex gap-4"><Gem className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><div><p className="font-display text-2xl">Entirely singular</p><p className="mt-1 text-xs leading-6 text-muted-foreground">Your commission is never reproduced.</p></div></div>
            <div className="flex gap-4"><MessageCircle className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><div><p className="font-display text-2xl">Private guidance</p><p className="mt-1 text-xs leading-6 text-muted-foreground">A thoughtful conversation, without obligation.</p></div></div>
            <div className="flex gap-4"><Clock3 className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><div><p className="font-display text-2xl">Made with time</p><p className="mt-1 text-xs leading-6 text-muted-foreground">Timing is confirmed around the individual work.</p></div></div>
          </div>
        </aside>
        <form ref={formRef} onSubmit={saveDraft} className="glass-panel p-7 sm:p-10">
          {piece && <input type="hidden" name="piece" value={piece} />}
          <div className="flex items-center justify-between gap-5 border-b border-border pb-6"><div><p className="eyebrow">Your vision</p><h2 className="mt-2 text-3xl">Prepare your inquiry</h2></div><span className="hidden text-[9px] uppercase tracking-[.16em] text-muted-foreground sm:block">Private by nature</span></div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">Your name <span aria-hidden="true" className="text-accent">*</span><input name="name" required autoComplete="name" className="input-art mt-3 normal-case tracking-normal" placeholder="How shall we address you?" /></label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">Email address <span aria-hidden="true" className="text-accent">*</span><input name="email" required type="email" autoComplete="email" className="input-art mt-3 normal-case tracking-normal" placeholder="you@example.com" /></label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:col-span-2">Phone Number<input name="phone" type="tel" autoComplete="tel" className="input-art mt-3 normal-case tracking-normal" placeholder="Enter your phone number" /></label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:col-span-2">Tell us your story <span aria-hidden="true" className="text-accent">*</span><textarea name="vision" required maxLength={1000} rows={1} className="input-art mt-3 h-[50px] min-h-[50px] resize-y normal-case leading-normal tracking-normal" placeholder="The feeling, scale, materials or occasion you have in mind…" /></label>
          </div>
          <Button type="submit" className="btn-art mt-8 h-auto w-full rounded-none">Save inquiry draft <Save className="h-4 w-4" strokeWidth={1.2} /></Button>
          <p className="mt-4 text-center text-[10px] leading-5 text-muted-foreground">This saves a draft on your device only. Direct atelier delivery has not been connected, so no message is sent.</p>
          {saved && <p className="mt-5 border border-primary/30 bg-primary/10 p-4 text-center text-xs leading-6 text-accent" role="status">Your inquiry draft is saved on this device. No message has been sent.</p>}
        </form>
      </div>
    </div>
  );
}
