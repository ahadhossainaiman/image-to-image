import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, Clock3, Gem, Mail, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPageHead } from "@/lib/seo";
import { enquiryOptions, EnquiryUnavailableError, InvalidEnquiryPhoneError, sendEnquiry } from "@/lib/wix/enquiry";

// Restore drafts saved before the form supported sending.
const legacyDraftKey = "thoa-inquiry-draft";
const submissionErrors = {
  invalid: "Please complete the required fields.",
  invalidPhone: "Enter the phone number with its country code, for example +1 813 555 0100.",
  unavailable: "Online enquiries are unavailable. Please email the studio.",
  error: "We couldn’t submit your enquiry. Please try again or email the studio.",
};

export const Route = createFileRoute("/contact")({
  head: () => getPageHead("/contact"),
  component: Contact,
});

export function Contact() {
  const search: Record<string, unknown> = useSearch({ strict: false });
  const piece = typeof search["piece"] === "string" ? search["piece"] : undefined;
  const [submission, setSubmission] = useState<"idle" | "sending" | "sent" | "pending" | keyof typeof submissionErrors>("idle");
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const feedback = submission === "idle" || submission === "sending" || submission === "sent" || submission === "pending"
    ? undefined
    : submissionErrors[submission];

  useEffect(() => {
    if (submission !== "sent" && submission !== "pending") return;
    const timeout = window.setTimeout(() => setSubmission("idle"), 3000);
    return () => window.clearTimeout(timeout);
  }, [submission]);

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(legacyDraftKey);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft) as Record<string, unknown>;
      for (const name of ["name", "email", "phone", "vision"] as const) {
        const field = formRef.current?.elements.namedItem(name);
        const value = draft[name];
        if (typeof value === "string" && (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
          field.value = field.maxLength > 0 ? value.slice(0, field.maxLength) : value;
        }
      }
      const preference = formRef.current?.elements.namedItem("enquiryType");
      if (preference instanceof HTMLSelectElement && draft["inquiryType"] === enquiryOptions[1]) {
        preference.value = enquiryOptions[1];
      }
    } catch {
      // Browsers may block storage, and old drafts may be invalid.
    }
  }, []);

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || submission === "pending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const enquiry = {
      name: read("name"),
      email: read("email"),
      phone: read("phone"),
      enquiryType: read("enquiryType"),
      vision: read("vision"),
      piece: read("piece"),
    };
    if (!enquiry.name || !enquiry.email || !enquiry.vision || !enquiryOptions.some((option) => option === enquiry.enquiryType)) {
      setSubmission("invalid");
      return;
    }
    submitting.current = true;
    setSubmission("sending");
    try {
      const result = await sendEnquiry(enquiry);
      form.reset();
      setSubmission(result === "confirmed" ? "sent" : "pending");
      try {
        window.localStorage.removeItem(legacyDraftKey);
      } catch {
        // Storage availability is independent of the Wix submission.
      }
    } catch (error) {
      if (error instanceof EnquiryUnavailableError) setSubmission("unavailable");
      else if (error instanceof InvalidEnquiryPhoneError) setSubmission("invalidPhone");
      else setSubmission("error");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 pt-8 pb-4 sm:px-10 md:py-16 lg:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <div className="botanical-rule mx-auto w-fit eyebrow text-[14px]">Private commissions</div>
        <h1 className="mt-3 text-[clamp(2.5rem,9vw,3.75rem)] md:mt-6 leading-[.95] sm:text-7xl">Let us imagine<br /><em className="text-accent">something together.</em></h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed md:mt-7 md:leading-7 text-muted-foreground">Tell us about the artwork that caught your eye, your space, or the story you would like us to bring to life.</p>
      </header>
      <div className="mt-5 grid gap-4 md:mt-16 md:gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <aside className="glass-panel min-w-0 self-start p-4 sm:p-6 md:p-10">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={1} />
          <h2 className="mt-3 text-3xl md:mt-6 md:text-4xl">A personal beginning</h2>
          <p className="mt-2 text-sm leading-relaxed md:mt-5 md:leading-7 text-muted-foreground">Every bespoke work starts with listening. Your ideas, preferred materials, scale and sense of wonder guide the conversation.</p>
          <div className="mt-4 space-y-3 border-t border-border pt-3 md:mt-8 md:space-y-6 md:pt-7">
            <div className="flex gap-3 md:gap-4"><Gem className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><div><p className="font-display text-xl md:text-2xl">Entirely singular</p><p className="mt-1 text-xs leading-6 text-muted-foreground">Your commission is never reproduced.</p></div></div>
            <div className="flex gap-3 md:gap-4"><MessageCircle className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><div><p className="font-display text-xl md:text-2xl">Private guidance</p><p className="mt-1 text-xs leading-6 text-muted-foreground">A thoughtful conversation, without obligation.</p></div></div>
            <div className="flex gap-3 md:gap-4"><Clock3 className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><div><p className="font-display text-xl md:text-2xl">Made with time</p><p className="mt-1 text-xs leading-6 text-muted-foreground">Timing is confirmed around the individual work.</p></div></div>
          </div>
          <address className="mt-4 grid gap-2 border-t border-border pt-4 text-sm not-italic md:mt-7 md:pt-5">
            <a href="tel:+18135883201" className="flex items-center gap-2 text-muted-foreground hover:text-accent"><Phone aria-hidden="true" className="size-4 shrink-0 text-primary" /> (813) 588-3201</a>
            <a href="mailto:Studio@ThyHouseOfArt.com" className="flex items-center gap-2 text-muted-foreground hover:text-accent"><Mail aria-hidden="true" className="size-4 shrink-0 text-primary" /> <span className="[overflow-wrap:anywhere]">Studio@ThyHouseOfArt.com</span></a>
          </address>
        </aside>
        <form ref={formRef} onSubmit={submitEnquiry} className="glass-panel min-w-0 p-4 sm:p-6 md:p-10">
          {piece && <input type="hidden" name="piece" value={piece} />}
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3 md:gap-5 md:pb-6"><div><p className="eyebrow text-[14px]">Your vision</p><h2 className="mt-2 text-3xl">Prepare your enquiry</h2></div><span className="hidden text-[9px] uppercase tracking-[.16em] text-muted-foreground sm:block">Private by nature</span></div>
          <fieldset disabled={submission === "sending"} className="mt-4 grid gap-4 md:mt-7 md:gap-6 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">Your name <span aria-hidden="true" className="text-accent">*</span><input name="name" required autoComplete="name" className="input-art mt-2 max-sm:text-base md:mt-3 normal-case tracking-normal" placeholder="How shall we address you?" /></label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">Email address <span aria-hidden="true" className="text-accent">*</span><input name="email" required type="email" autoComplete="email" className="input-art mt-2 max-sm:text-base md:mt-3 normal-case tracking-normal" placeholder="you@example.com" /></label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:col-span-2">Phone Number<input name="phone" type="tel" autoComplete="tel" aria-invalid={submission === "invalidPhone" || undefined} className="input-art mt-2 max-sm:text-base md:mt-3 normal-case tracking-normal" placeholder="+1 813 555 0100" /></label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:col-span-2">
              Enquiry type
              <span className="relative mt-2 block md:mt-3">
                <select name="enquiryType" defaultValue={enquiryOptions[0]} className="input-art block appearance-none pr-10 normal-case tracking-normal [color-scheme:dark] max-sm:text-base">
                  {enquiryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-primary" />
              </span>
            </label>
            <label className="text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:col-span-2">Tell us your story <span aria-hidden="true" className="text-accent">*</span><textarea name="vision" required maxLength={1000} rows={6} className="input-art mt-2 max-sm:text-base md:mt-3 h-32 min-h-32 md:h-44 md:min-h-44 resize-y normal-case leading-normal tracking-normal" placeholder="The feeling, scale, materials or occasion you have in mind…" /></label>
          </fieldset>
          <Button type="submit" disabled={submission === "sending" || submission === "pending"} className="btn-art mt-5 md:mt-8 h-auto w-full rounded-none text-[13px]">
            {submission === "sending" ? "Sending…" : "Send Enquiry"} <Send aria-hidden="true" className="h-4 w-4" strokeWidth={1.2} />
          </Button>
          {submission === "sent" && <p className="mt-5 border border-primary/30 bg-primary/10 p-4 text-center text-xs leading-6 text-accent" role="status">Thank you. Your enquiry has been submitted.</p>}
          {submission === "pending" && <p className="mt-5 p-4 text-center text-xs leading-6 text-accent" role="status">Thank you. We received your enquiry request.</p>}
          {feedback && <p className="mt-4 text-center text-sm text-accent" role="alert">{feedback}</p>}
        </form>
      </div>
    </div>
  );
}
