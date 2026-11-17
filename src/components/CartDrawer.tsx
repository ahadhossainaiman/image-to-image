import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { Sheet as Dialog, SheetClose as DialogClose, SheetContent as DialogContent, SheetDescription as DialogDescription, SheetTitle as DialogTitle, SheetTrigger as DialogTrigger } from "@/components/ui/sheet";
import { removeFromCart, useCartDetails } from "@/lib/cart";
import { setCartDrawerOpen, useCartDrawerOpen } from "@/lib/cart-drawer";

export function CartDrawer({ children }: { children: ReactNode }) {
  const items = useCartDetails();
  const open = useCartDrawerOpen();

  return (
    <Dialog open={open} onOpenChange={setCartDrawerOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent side="right" className="cart-sheet glass-strong flex h-svh w-full max-w-md flex-col gap-0 rounded-none p-0 text-foreground sm:max-w-md">
        <div className="flex items-start justify-between border-b border-border px-7 py-7">
          <div>
            <p className="eyebrow">Your private selection</p>
            <DialogTitle className="mt-2 font-display text-4xl font-normal">The Collector’s Cart</DialogTitle>
            <DialogDescription className="mt-2 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "singular work" : "singular works"} selected
            </DialogDescription>
          </div>
          <ShoppingBag className="mt-2 h-5 w-5 text-primary" strokeWidth={1.1} />
        </div>
        <div className="flex-1 overflow-y-auto px-7">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/5">
                <ShoppingBag className="h-5 w-5 text-primary" strokeWidth={1} />
              </div>
              <p className="mt-7 font-display text-3xl">Your gallery awaits</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Discover a singular piece and begin your private collection.</p>
              <DialogClose asChild><Link to="/shop" className="btn-outline-art mt-8">Explore the gallery</Link></DialogClose>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.lineItemId || item.slug} className="flex gap-4 py-6">
                  <DialogClose asChild><Link to="/artwork/$slug" params={{ slug: item.slug }} className="block w-24 shrink-0 bg-muted">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="aspect-[4/5] w-full object-cover" />
                    ) : (
                      <div className="aspect-[4/5] w-full flex items-center justify-center text-xs text-muted-foreground">Artwork</div>
                    )}
                  </Link></DialogClose>
                  <div className="flex min-w-0 flex-1 flex-col py-1">
                    <DialogClose asChild><Link to="/artwork/$slug" params={{ slug: item.slug }} className="font-display text-2xl leading-tight hover:text-accent">{item.title}</Link></DialogClose>
                    <p className="mt-2 text-xs text-muted-foreground">{item.formattedPrice}</p>
                    <button onClick={() => removeFromCart(item.slug)} className="mt-auto flex items-center gap-2 self-start text-[10px] uppercase tracking-[.16em] text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border p-7">
            <p className="text-xs leading-relaxed text-muted-foreground">Every work is one of a kind. Acquisition and insured delivery are confirmed personally by the atelier.</p>
            <DialogClose asChild><Link to="/cart" className="btn-art mt-5 w-full">Review your selection <ArrowRight className="h-4 w-4" /></Link></DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
