import { Link } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Instagram, LockKeyhole, Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";
import { requestNewsletterSignup } from "@/lib/wix/newsletter";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Collections" },
  { to: "/atelier-story", label: "Atelier Story" },
  { to: "/about-the-artists", label: "About The Artists" },
  { to: "/contact", label: "Bespoke enquiry" },
] as const;

function Brand({ logoClassName = "h-auto w-30 sm:w-38" }: { logoClassName?: string }) {
  return (
    <Link to="/" className="block w-fit min-w-0 max-w-full" aria-label="Thy House Of Art home">
      <img src="/Thy_House_Of_Art_Logo.png" alt="Thy House Of Art" width={2000} height={1000} className={logoClassName} />
    </Link>
  );
}

export function SiteHeader() {
  const cart = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-2 px-4 sm:h-[5.5rem] sm:gap-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              preload={item.to === "/shop" ? "intent" : false}
              className="text-[10px] uppercase tracking-[.2em] text-muted-foreground transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          <CartDrawer>
            <button type="button" aria-label={`Open shopping cart with ${cart.length} ${cart.length === 1 ? "item" : "items"}`} className="flex h-11 cursor-pointer items-end gap-1 px-2.5 pb-2 text-accent transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-12 sm:px-3.5">
              <span aria-hidden="true" className="relative h-8 w-8 shrink-0">
                <ShoppingCart className="absolute inset-x-0 bottom-0 h-7 w-8" strokeWidth={2.3} />
                <span className="absolute top-0 right-0.5 px-0.5 text-xs leading-none font-bold tabular-nums">{cart.length}</span>
              </span>
              <span aria-hidden="true" className="pb-0.5 text-xs leading-none font-normal">Cart</span>
            </button>
          </CartDrawer>
          <button className="flex size-11 items-center justify-center lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" strokeWidth={1.15} />
          </button>
        </div>
      </div>
      {open && createPortal(
        <div className="glass-strong fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:p-7 lg:hidden">
          <div className="flex items-center justify-between">
            <Brand />
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-border" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" strokeWidth={1.1} />
            </button>
          </div>
          <nav className="my-4 flex flex-col sm:my-auto" aria-label="Mobile navigation">
            {nav.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                preload={item.to === "/shop" ? "intent" : false}
                  onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-3 border-b border-border py-3 sm:py-5"
              >
                <span className="flex min-w-0 items-baseline gap-3 sm:gap-5"><span className="text-[9px] tracking-[.2em] text-primary">0{index + 1}</span><span className="font-display text-3xl sm:text-4xl group-hover:text-accent">{item.label}</span></span>
                <ArrowRight className="h-4 w-4 text-primary" strokeWidth={1} />
              </Link>
            ))}
          </nav>
          <div className="border-t border-border pt-3 sm:pt-6">
            <p className="text-[9px] uppercase tracking-[.2em] text-muted-foreground">One of a kind. Always.</p>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}

export function SiteFooter() {
  const [signup, setSignup] = useState<"idle" | "sending" | "confirmed" | "pending" | "error">("idle");
  const signingUp = useRef(false);

  useEffect(() => {
    if (signup !== "confirmed" && signup !== "pending") return;
    const timeout = window.setTimeout(() => setSignup("idle"), 3000);
    return () => window.clearTimeout(timeout);
  }, [signup]);

  async function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signingUp.current || signup === "pending") return;
    const form = event.currentTarget;
    const email = String(new FormData(form).get("collector-email") ?? "").trim();
    if (!email) return;

    signingUp.current = true;
    setSignup("sending");
    try {
      const result = await requestNewsletterSignup(email);
      form.reset();
      setSignup(result);
    } catch {
      setSignup("error");
    } finally {
      signingUp.current = false;
    }
  }

  return (
    <footer className="relative mt-6 overflow-hidden md:mt-24 border-t border-border bg-forest">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-10 md:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:gap-12 lg:grid-cols-[1.1fr_.7fr_1.2fr] lg:gap-20">
          <div>
            <Brand logoClassName="h-auto w-52 sm:w-60" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed md:mt-6 md:leading-7 text-muted-foreground">Collectors find great value in art that moves them. They see the world differently and seek art that stirs their emotions and captivates their souls. With that, they discover that everything created with love, talent and intention holds a little magic.</p>
            <div className="mt-3 flex items-center gap-2 md:mt-7 md:gap-3 text-[10px] uppercase tracking-[.17em] text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 text-primary" strokeWidth={1.2} /> A SECURE COLLECTOR'S EXPERIENCE</div>
          </div>
          <div>
            <p className="eyebrow">The atelier</p>
            <div className="mt-4 flex flex-col items-start gap-1 text-sm text-muted-foreground md:mt-6 md:gap-4">
              {nav.map((item) => <Link key={item.to} to={item.to} className="flex min-h-8 items-center transition-colors hover:text-accent md:min-h-0">{item.label}</Link>)}
              <a
                href="https://www.instagram.com/thyhouseofart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-8 items-center gap-2 transition-colors md:min-h-0 hover:text-accent"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.2} aria-hidden="true" />
                Instagram
              </a>
            </div>
          </div>
          <div>
            <p className="eyebrow">Collector notes</p>
            <p className="mt-2 font-display text-2xl md:mt-5 md:text-3xl leading-tight">New works, private previews{" "}<br className="hidden md:block" />and stories from the atelier.</p>
            <form className="mt-2 flex border-b md:mt-6 border-primary/35" onSubmit={handleNewsletter} onChange={() => {
              if (signup === "error") setSignup("idle");
            }}>
              <label className="sr-only" htmlFor="collector-email">Email address</label>
              <input id="collector-email" name="collector-email" type="email" autoComplete="email" suppressHydrationWarning required readOnly={signup === "sending"} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-base md:py-4 md:text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <button type="submit" disabled={signup === "sending" || signup === "pending"} className="flex items-center gap-2 pl-4 text-[10px] uppercase tracking-[.18em] text-primary hover:text-accent disabled:opacity-50">
                {signup === "sending" ? "Sending…" : "Subscribe"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
            {(signup === "confirmed" || signup === "pending") && (
              <p className="mt-3 text-xs leading-relaxed text-accent" role="status">
                {signup === "confirmed" ? "Thank you. Your signup request has been submitted." : "Thank you. We received your signup request."}
              </p>
            )}
            {signup === "error" && <p className="mt-3 text-xs leading-relaxed text-accent" role="alert">We couldn’t submit your signup request. Please try again.</p>}
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-3 md:mt-16 md:gap-4 md:pt-7 text-[9px] uppercase tracking-[.18em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Thy House Of Art</p>
          <p>Handmade slowly. Collected forever.</p>
        </div>
      </div>
    </footer>
  );
}
