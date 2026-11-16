import { Link } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Instagram, LockKeyhole, Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { currencyOptions, useCurrency, type CurrencyCode } from "@/lib/currency";
import { CartDrawer } from "@/components/CartDrawer";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Collections" },
  { to: "/atelier-story", label: "Atelier Story" },
  { to: "/about-creators", label: "About Creators" },
  { to: "/contact", label: "Bespoke Inquiry" },
] as const;

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Thy House Of Art home">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 transition-colors group-hover:bg-primary/10">
        <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.1} />
      </span>
      <span>
        <span className="block font-display text-[1.55rem] leading-none tracking-[.025em]">Thy House Of Art</span>
        <span className="mt-1 hidden text-[7px] uppercase tracking-[.32em] text-primary sm:block">Where angels & fairies live</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const cart = useCart();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[5.5rem] max-w-[1600px] items-center justify-between gap-5 px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[10px] uppercase tracking-[.2em] text-muted-foreground transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <label className="hidden items-center gap-2 border-r border-border pr-4 sm:flex">
            <span className="sr-only">Display currency</span>
            <select
              aria-label="Display currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
              className="cursor-pointer bg-transparent text-[10px] tracking-[.16em] text-muted-foreground outline-none hover:text-accent"
              title="Indicative display conversion"
            >
              {currencyOptions.map((option) => <option key={option.code} value={option.code} className="bg-background text-foreground">{option.label}</option>)}
            </select>
          </label>
          <CartDrawer>
            <button aria-label={`Open shopping cart with ${cart.length} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10">
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.15} />
              {cart.length > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{cart.length}</span>}
            </button>
          </CartDrawer>
          <button className="flex h-10 w-10 items-center justify-center lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" strokeWidth={1.15} />
          </button>
        </div>
      </div>
      {open && createPortal(
        <div className="glass-strong fixed inset-0 z-50 flex flex-col px-7 py-7 lg:hidden">
          <div className="flex items-center justify-between">
            <Brand />
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-border" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" strokeWidth={1.1} />
            </button>
          </div>
          <nav className="my-auto flex flex-col" aria-label="Mobile navigation">
            {nav.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                  onClick={() => setOpen(false)}
                className="group flex items-center justify-between border-b border-border py-5"
              >
                <span className="flex items-baseline gap-5"><span className="text-[9px] tracking-[.2em] text-primary">0{index + 1}</span><span className="font-display text-4xl group-hover:text-accent">{item.label}</span></span>
                <ArrowRight className="h-4 w-4 text-primary" strokeWidth={1} />
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="text-[9px] uppercase tracking-[.2em] text-muted-foreground">One of a kind. Always.</p>
            <select aria-label="Mobile display currency" value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} className="bg-transparent text-[10px] tracking-[.16em] text-primary outline-none">
              {currencyOptions.map((option) => <option key={option.code} value={option.code} className="bg-background">{option.label}</option>)}
            </select>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}

export function SiteFooter() {
  const [newsletterNote, setNewsletterNote] = useState("");
  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterNote("Collector notes are coming soon. Please use Bespoke Inquiry for a private introduction.");
  }

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-forest">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_.7fr_1.2fr] lg:gap-20">
          <div>
            <Brand />
            <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">Singular handmade works for collectors who believe an object can hold a little magic.</p>
            <div className="mt-7 flex items-center gap-3 text-[10px] uppercase tracking-[.17em] text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 text-primary" strokeWidth={1.2} /> Secure collector experience</div>
          </div>
          <div>
            <p className="eyebrow">The atelier</p>
            <div className="mt-6 flex flex-col items-start gap-4 text-sm text-muted-foreground">
              {nav.map((item) => <Link key={item.to} to={item.to} className="transition-colors hover:text-accent">{item.label}</Link>)}
              <span className="flex items-center gap-2" aria-label="Instagram — link to be added"><Instagram className="h-4 w-4" strokeWidth={1.2} /> Instagram <span className="text-[8px] uppercase tracking-wider">(coming soon)</span></span>
            </div>
          </div>
          <div>
            <p className="eyebrow">Collector notes</p>
            <p className="mt-5 font-display text-3xl leading-tight">New works, private previews<br />and stories from the atelier.</p>
            <form className="mt-6 flex border-b border-primary/35" onSubmit={handleNewsletter} autoComplete="off">
              <label className="sr-only" htmlFor="collector-email">Email address</label>
              <input id="collector-email" name="collector-email" type="email" autoComplete="off" suppressHydrationWarning required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <button className="flex items-center gap-2 pl-4 text-[10px] uppercase tracking-[.18em] text-primary hover:text-accent">Join <ArrowRight className="h-4 w-4" /></button>
            </form>
            {newsletterNote && <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">{newsletterNote}</p>}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-7 text-[9px] uppercase tracking-[.18em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Thy House Of Art</p>
          <p>Handmade slowly. Collected forever.</p>
        </div>
      </div>
    </footer>
  );
}
