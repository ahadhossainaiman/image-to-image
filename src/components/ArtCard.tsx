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
          <div className="art-frame glass-panel aspect-[4/5] w-full p-2 sm:p-3">
            <span className="relative block size-full overflow-hidden">
              <img
                src={cover.src}
                alt={cover.alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : undefined}
                className="h-full w-full object-cover"
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
                    "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
                    loadedPreview === preview.src && "group-hover:opacity-100",
                  )}
                />
              )}
              <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/55 to-transparent" />
              <span className="glass-panel absolute right-2 top-2 px-2 py-1.5 text-[9px] uppercase tracking-[.18em] text-foreground sm:right-4 sm:top-4 sm:px-3 sm:py-2">One of one</span>
            </span>
          </div>
        ) : <div className="glass-panel aspect-[4/5]" />}
        <div className="pt-3 md:pt-6">
          <div className="flex items-start justify-between gap-3 md:gap-5">
            <div className="min-w-0">
              {a.medium && <p className="eyebrow text-[9px] [overflow-wrap:anywhere]">{a.medium}</p>}
              {price && <p className="text-xs tracking-wide text-muted-foreground">{price}</p>}
              <h3 className="mt-1 text-2xl leading-tight [overflow-wrap:anywhere] transition-colors group-hover:text-accent md:mt-2 md:text-3xl">{a.title}</h3>
            </div>
            <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:bg-primary/10">
              <ArrowUpRight className="size-4 text-primary" strokeWidth={1.1} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
