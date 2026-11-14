import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/data/catalog";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function ArtCard({ a, className, priority = false }: { a: Artwork; className?: string; priority?: boolean }) {
  const { formatPrice } = useCurrency();
  return (
    <article className={cn("group", className)}>
      <Link to="/artwork/$slug" params={{ slug: a.slug }} className="block" aria-label={`View ${a.title}`}>
        <div className="art-frame glass-panel aspect-[4/5] p-2 sm:p-3">
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={a.images[0]?.src}
              alt={a.images[0]?.alt}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
            {a.images[1] && (
              <img
                src={a.images[1].src}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/55 to-transparent" />
            <span className="glass-panel absolute right-4 top-4 px-3 py-2 text-[9px] uppercase tracking-[.18em] text-foreground">One of one</span>
          </div>
        </div>
        <div className="pt-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="eyebrow text-[9px]">{a.medium}</p>
              <h3 className="mt-2 text-3xl leading-tight transition-colors group-hover:text-accent">{a.title}</h3>
            </div>
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:bg-primary/10">
              <ArrowUpRight className="h-4 w-4 text-primary" strokeWidth={1.1} />
            </span>
          </div>
          <p className="mt-3 text-xs tracking-wide text-muted-foreground">{formatPrice(a)}</p>
        </div>
      </Link>
    </article>
  );
}
