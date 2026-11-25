import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { Artwork } from "@/data/catalog";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function ArtCard({ a, className, priority = false }: { a: Artwork; className?: string; priority?: boolean }) {
  const price = formatPrice(a);
  const cover = a.images[0];
  const preview = a.images.find((image) => image.src && image.src !== cover?.src);
  const [loadedPreview, setLoadedPreview] = useState<string>();

  return (
    <article className={cn("min-w-0", className)}>
      <Link to="/artwork/$slug" params={{ slug: a.slug }} preload="intent" className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-label={`View ${a.title}`}>
        {cover?.src ? (
          <div className="glass-panel aspect-square w-full overflow-hidden p-1.5 sm:p-2">
            <span className="relative block size-full overflow-hidden">
              <img
                src={cover.src}
                alt={cover.alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : undefined}
                className="h-full w-full object-contain"
              />
              {preview && (
                <img
                  key={preview.src}
                  src={preview.src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoadedPreview(preview.src)}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
                    loadedPreview === preview.src && "group-hover:opacity-100",
                  )}
                />
              )}
              <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/55 to-transparent" />
              <span className="glass-panel absolute right-1.5 top-1.5 px-1.5 py-1 text-[9px] uppercase tracking-[.14em] text-foreground sm:right-2 sm:top-2 sm:px-2">One of one</span>
            </span>
          </div>
        ) : <div className="glass-panel aspect-square" />}
        <div className="flex items-center justify-between gap-2 pt-2 sm:gap-3 sm:pt-3">
          <div className="min-w-0">
            {price && <p className="text-xs tracking-wide text-muted-foreground lg:text-sm">{price}</p>}
            <h3 className="mt-0.5 text-xl leading-tight [overflow-wrap:anywhere] transition-colors group-hover:text-accent sm:text-2xl">{a.title}</h3>
            {a.medium && <p className="eyebrow mt-1 [overflow-wrap:anywhere]">{a.medium}</p>}
          </div>
          <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:bg-primary/10 sm:size-8">
            <ArrowUpRight className="size-3.5 text-primary" strokeWidth={1.1} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
