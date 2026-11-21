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
  { to: "/about-the-artists", label: "About The Artists" },
  { to: "/contact", label: "Bespoke Inquiry" },
] as const;

function Brand() {
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Thy House Of Art home">
      <span className="flex size-8 shrink-0 items-center sm:size-9 justify-center rounded-full border border-primary/35 transition-colors group-hover:bg-primary/10">
        <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.1} />
      </span>
      <span>
        <span className="block font-display text-[1.25rem] leading-none sm:text-[1.55rem] sm:tracking-[.025em]">Thy House Of Art</span>
        <span className="mt-1 hidden text-[7px] uppercase tracking-[.32em] text-primary sm:block">Discover the beauty within™</span>
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
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-2 px-4 sm:h-[5.5rem] sm:gap-5 sm:px-8">
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
        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
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
            <button aria-label={`Open shopping cart with ${cart.length} items`} className="relative flex size-11 sm:size-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10">
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.15} />
              {cart.length > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{cart.length}</span>}
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
                  onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-3 border-b border-border py-3 sm:py-5"
              >
                <span className="flex min-w-0 items-baseline gap-3 sm:gap-5"><span className="text-[9px] tracking-[.2em] text-primary">0{index + 1}</span><span className="font-display text-3xl sm:text-4xl group-hover:text-accent">{item.label}</span></span>
                <ArrowRight className="h-4 w-4 text-primary" strokeWidth={1} />
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:pt-6">
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
    <footer className="relative mt-6 overflow-hidden md:mt-24 border-t border-border bg-forest">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-10 md:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:gap-12 lg:grid-cols-[1.1fr_.7fr_1.2fr] lg:gap-20">
          <div>
            <Brand />
            <p className="mt-3 max-w-sm text-sm leading-relaxed md:mt-6 md:leading-7 text-muted-foreground">Collectors find great value in art that moves them. They see the world differently and seek art that stirs their emotions and captivates their souls. With that, they discover that everything created with love, talent and intention holds a little magic.</p>
            <div className="mt-3 flex items-center gap-2 md:mt-7 md:gap-3 text-[10px] uppercase tracking-[.17em] text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 text-primary" strokeWidth={1.2} /> A SECURE COLLECTOR'S EXPERIENCE</div>
          </div>
          <div>
            <p className="eyebrow">The atelier</p>
            <div className="mt-2 grid grid-cols-2 items-start gap-x-3 gap-y-1 md:mt-6 md:flex md:flex-col md:gap-4 text-sm text-muted-foreground">
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
            <form className="mt-2 flex border-b md:mt-6 border-primary/35" onSubmit={handleNewsletter} autoComplete="off">
              <label className="sr-only" htmlFor="collector-email">Email address</label>
              <input id="collector-email" name="collector-email" type="email" autoComplete="off" suppressHydrationWarning required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-base md:py-4 md:text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <button className="flex items-center gap-2 pl-4 text-[10px] uppercase tracking-[.18em] text-primary hover:text-accent">Join <ArrowRight className="h-4 w-4" /></button>
            </form>
            {newsletterNote && <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">{newsletterNote}</p>}
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
