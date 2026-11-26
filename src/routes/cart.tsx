import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, ShieldCheck, X } from "lucide-react";
import { useCartDetails, removeFromCart, syncCartWithWix } from "@/lib/cart";
import { catalogPrice, formatPrice } from "@/lib/currency";
import { isWixConfigured, redirectToWixCheckout } from "@/lib/wix";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [
    { title: "Collector’s Cart — Thy House Of Art" },
    { name: "description", content: "Review your private selection of one-of-a-kind artworks." },
    { property: "og:title", content: "Collector’s Cart — Thy House Of Art" },
    { property: "og:description", content: "Review your private selection of singular artworks." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Cart,
});

function Cart() {
  const items = useCartDetails();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    function restoreCheckout(event: PageTransitionEvent) {
      if (!event.persisted) return;
      setIsCheckingOut(false);
      setCheckoutError(null);
      void syncCartWithWix();
    }

    window.addEventListener("pageshow", restoreCheckout);
    return () => window.removeEventListener("pageshow", restoreCheckout);
  }, []);

  const prices = items.map(catalogPrice);
  const currency = prices[0]?.currency;
  const subtotal = currency && prices.every((price) => price?.currency === currency)
    ? prices.reduce((sum, price) => sum + (price?.amount ?? 0), 0)
    : null;
  const canCheckout = isWixConfigured() && items.length > 0 && items.every((item) => item.lineItemId);

  async function handleCheckout() {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const result = await redirectToWixCheckout();
      if (result.error) setCheckoutError(result.error);
    } catch {
      setCheckoutError("Unable to start checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-24">
      <Link to="/shop" className="flex w-fit items-center gap-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground hover:text-accent"><ArrowLeft className="h-4 w-4" /> Continue exploring</Link>
      <header className="mt-10 border-b border-border pb-10"><p className="eyebrow">Your private selection</p><h1 className="mt-4 text-6xl sm:text-7xl">The Collector’s Cart</h1><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">A selection of singular works. Each exists only once and is reserved through personal confirmation with the atelier.</p></header>
      {items.length === 0 ? (
        <div className="glass-panel mt-12 py-24 text-center"><p className="font-display text-4xl">Your gallery awaits.</p><p className="mt-4 text-sm text-muted-foreground">Discover a piece that speaks only to you.</p><Link to="/shop" className="btn-art mt-8">Explore the gallery <ArrowRight className="h-4 w-4" /></Link></div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_.75fr]">
          <ul className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <li key={item.lineItemId || item.slug} className="flex gap-5 py-7 sm:gap-7">
                <Link to="/artwork/$slug" params={{ slug: item.slug }} className="w-28 shrink-0 sm:w-36 bg-muted">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="aspect-[4/5] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/5] w-full" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col py-1">
                  {item.reference && <p className="eyebrow [overflow-wrap:anywhere]">{item.reference}</p>}
                  {item.title && <Link to="/artwork/$slug" params={{ slug: item.slug }} className="mt-2 font-display text-3xl leading-tight hover:text-accent sm:text-4xl">{item.title}</Link>}
                  {item.formattedPrice && <p className="mt-3 text-xs text-muted-foreground">{item.formattedPrice}</p>}
                  <button onClick={() => removeFromCart(item.slug)} className="mt-auto flex w-fit items-center gap-2 text-[9px] uppercase tracking-[.16em] text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /> Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <aside className="glass-panel h-fit p-7 lg:sticky lg:top-28">
            <p className="eyebrow">Acquisition summary</p>
            <div className="mt-6 flex items-center justify-between border-b border-border pb-5"><span className="text-sm text-muted-foreground">Selected works</span><span className="font-display text-2xl">{items.length}</span></div>
            {subtotal != null && <div className="mt-5 flex items-center justify-between border-b border-border pb-5"><span className="text-sm text-muted-foreground">Subtotal ({currency})</span><span className="text-sm text-accent">{formatPrice({ price: subtotal, currency })}</span></div>}
            <div className="mt-6 space-y-4 text-xs leading-6 text-muted-foreground"><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} />White-glove insured delivery quoted for your destination.</p><p className="flex gap-3"><BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} />Certificate of Authenticity with each final acquisition.</p></div>

            {checkoutError && (
              <div className="mt-4 rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive" role="alert">
                {checkoutError}
              </div>
            )}

            {canCheckout ? (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="btn-art mt-8 w-full cursor-pointer disabled:opacity-60"
              >
                {isCheckingOut ? "Connecting to secure checkout..." : "Proceed to secure checkout"} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link to="/contact" className="btn-art mt-8 w-full">
                Continue to private enquiry <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
