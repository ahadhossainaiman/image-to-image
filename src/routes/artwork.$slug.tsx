import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, MessageCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { getArtworkBySlug, getCategoryBySlugOrId } from "@/lib/wix";
import type { Artwork, Category } from "@/data/catalog";
import { addToCart, useCartDetails } from "@/lib/cart";
import { catalogPrice, formatPrice } from "@/lib/currency";
import { CertificateStatement } from "@/components/CertificateStatement";
import { ArtworkGallery } from "@/components/ArtworkGallery";
import { WixArtworkDetails } from "@/components/WixArtworkDetails";
import { ArtworkDescription } from "@/components/ArtworkCopy";
import { CatalogLoading } from "@/components/CatalogLoading";
import { catalogCanonical } from "@/lib/seo";

export const Route = createFileRoute("/artwork/$slug")({
  pendingComponent: () => <CatalogLoading page="artwork" />,
  pendingMs: 160,
  pendingMinMs: 180,
  staleTime: 30_000,
  preloadStaleTime: 30_000,
  loader: async ({ params }) => {
    const artwork = await getArtworkBySlug(params.slug);
    if (!artwork?.published) throw notFound();
    const categoryKeys = artwork.wixCollectionIds ?? (artwork.category ? [artwork.category] : []);
    const categories = (await Promise.all([...new Set(categoryKeys)].map(getCategoryBySlugOrId)))
      .filter((category): category is Category => Boolean(category?.published));
    return {
      artwork,
      categories,
    };
  },
  head: ({ loaderData }) => loaderData?.artwork ? {
    links: [{ rel: "canonical", href: catalogCanonical("/artwork", loaderData.artwork.slug) }],
    meta: [
      { title: `${loaderData.artwork.title} — Thy House Of Art` },
      ...(loaderData.artwork.description ? [{ name: "description", content: loaderData.artwork.description }] : []),
      { property: "og:title", content: `${loaderData.artwork.title} — Thy House Of Art` },
      ...(loaderData.artwork.description ? [{ property: "og:description", content: loaderData.artwork.description }] : []),
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["VisualArtwork", "Product"],
        name: loaderData.artwork.title,
        description: loaderData.artwork.description,
        artMedium: loaderData.artwork.medium,
        artform: "Sculpture",
        sku: loaderData.artwork.wixDetails ? loaderData.artwork.wixDetails.sku || undefined : loaderData.artwork.reference,
        brand: { "@type": "Brand", name: loaderData.artwork.wixDetails?.brand || "Thy House Of Art" },
        additionalProperty: { "@type": "PropertyValue", name: "Edition", value: "One of one" },
      }),
    }],
  } : { meta: [{ title: "Artwork unavailable" }, { name: "robots", content: "noindex" }] },
  component: ArtworkPage,
});

function AcquisitionButton({ artwork, compact = false }: { artwork: Artwork; compact?: boolean }) {
  const inCart = useCartDetails().some((item) => item.slug === artwork.slug || (artwork.wixProductId && item.productId === artwork.wixProductId));
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(false);

  async function handleAdd() {
    setIsAdding(true);
    setAddError(false);
    try {
      setAddError(!(await addToCart(artwork)));
    } catch {
      setAddError(true);
    } finally {
      setIsAdding(false);
    }
  }

  if (!catalogPrice(artwork) || artwork.wixDetails?.requiresPurchaseOptions) {
    return (
      <Link
        to="/contact"
        search={{ piece: artwork.title }}
        className={compact ? "btn-art min-h-11 shrink-0 gap-2 px-3 py-2 tracking-[.12em] md:min-h-12 md:px-5" : "btn-art w-full"}
      >
        Acquire artwork <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }
  const outOfStock = artwork.availability === "acquired";
  return (
    <div className={compact ? "shrink-0" : undefined}>
      <button
        type="button"
        className={compact ? "btn-art min-h-11 gap-2 px-3 py-2 tracking-[.12em] md:min-h-12 md:px-5" : "btn-art w-full"}
        disabled={outOfStock || inCart || isAdding}
        onClick={handleAdd}
      >
        {outOfStock ? "Out of stock" : isAdding ? "Adding to cart…" : inCart ? "In your cart" : "Add to cart"} <ShoppingBag className="h-4 w-4" />
      </button>
      {addError && !inCart && <p className="mt-2 text-xs text-destructive" role="alert">Could not add this artwork. Please try again.</p>}
    </div>
  );
}

function ArtworkPage() {
  const { artwork, categories } = Route.useLoaderData();
  const category = categories[0];
  const details = artwork.wixDetails;
  const price = formatPrice(artwork);
  const gallery = details?.gallery ?? artwork.images;
  const detailsCardRef = useRef<HTMLElement>(null);
  const purchaseActionRef = useRef<HTMLDivElement>(null);
  const [showPurchaseBar, setShowPurchaseBar] = useState(false);

  useEffect(() => {
    const action = purchaseActionRef.current;
    if (!action) return;
    const card = detailsCardRef.current;
    const header = document.querySelector("header");

    const updatePurchaseBar = () => {
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      setShowPurchaseBar(action.getBoundingClientRect().bottom < headerBottom);
    };

    const updateLayout = () => {
      // Keep the end of tall cards above the desktop purchase bar.
      if (card) card.style.setProperty("--artwork-card-height", `${card.offsetHeight}px`);
      updatePurchaseBar();
    };

    updateLayout();
    window.addEventListener("scroll", updatePurchaseBar, { passive: true });
    const observer = new ResizeObserver(updateLayout);
    observer.observe(action);
    if (card) observer.observe(card);
    if (header) observer.observe(header);
    window.addEventListener("resize", updatePurchaseBar);
    return () => {
      window.removeEventListener("scroll", updatePurchaseBar);
      window.removeEventListener("resize", updatePurchaseBar);
      observer.disconnect();
    };
  }, [artwork.slug]);

  return (
    <div className="pb-24 md:pb-0">
      <div className="mx-auto max-w-[1600px] px-4 pt-7 sm:px-8 md:pt-10">
        <Link
          {...(category
            ? { to: "/collections/$slug", params: { slug: category.slug } } as const
            : { to: "/shop" } as const)}
          preload="intent"
          className="flex w-fit items-center gap-2 text-[10px] uppercase tracking-[.16em] text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> {category?.shortName ?? "The gallery"}
        </Link>
      </div>
      <div className={`mx-auto mt-4 grid max-w-[1600px] items-start gap-5 px-4 sm:px-8 md:mt-6 ${gallery.length > 0
        ? "md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-7 lg:gap-12"
        : ""}`}>
        {gallery.length > 0 && <ArtworkGallery key={artwork.slug} items={gallery} />}

        <aside ref={detailsCardRef} className={`glass-panel min-w-0 p-4 sm:p-5 lg:p-7 ${gallery.length > 0
          ? "md:sticky md:top-[min(6.5rem,calc(100dvh_-_var(--artwork-card-height,100dvh)_-_6rem))]"
          : ""}`}>
          {artwork.medium && (
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="eyebrow">{artwork.medium}</p>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" strokeWidth={1} />
            </div>
          )}
          <h1 className="text-[1.75rem] leading-[1.08] [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl">{artwork.title}</h1>
          {details && details.ribbons.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Product ribbons">
              {details.ribbons.map((ribbon) => (
                <li key={ribbon} className="rounded-full border border-primary/40 px-3 py-1 text-xs text-accent">{ribbon}</li>
              ))}
            </ul>
          )}
          {(price || details?.priceRange || details?.unitPrice) && (
            <div className="mt-3">
              {price && (
                <p className="flex flex-wrap items-baseline gap-x-3 text-base text-accent md:text-lg">
                  <span>{price}</span>
                  {details?.regularPrice && (
                    <s className="text-sm text-muted-foreground"><span className="sr-only">Regular price </span>{details.regularPrice}</s>
                  )}
                </p>
              )}
              {details?.priceRange && <p className="mt-1 text-sm text-muted-foreground">Variant prices {details.priceRange}</p>}
              {details?.unitPrice && <p className="mt-1 text-xs text-muted-foreground">{details.unitPrice}</p>}
            </div>
          )}
          <div ref={purchaseActionRef} className="mt-4"><AcquisitionButton key={artwork.slug} artwork={artwork} /></div>
          <Link
            to="/contact"
            search={{ piece: artwork.title }}
            className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 text-[10px] uppercase tracking-[.16em] text-primary hover:text-accent"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.2} /> Bespoke enquiry
          </Link>
          {details && <WixArtworkDetails details={details} categories={categories} />}
          {artwork.details.length > 0 && (
            <section className="mt-5 border-t border-border pt-4">
              <h2 className="eyebrow">The details</h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-muted-foreground">
                {artwork.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </section>
          )}
          {(artwork.intro || artwork.description) && (
            <section className="mt-5 border-t border-border pt-5 sm:pt-6" aria-labelledby="artwork-description">
              <h2 id="artwork-description" className="text-2xl">About this work</h2>
              {artwork.intro && <p className="mt-2 font-display text-lg italic leading-snug md:text-xl">{artwork.intro}</p>}
              {artwork.description && <ArtworkDescription key={artwork.slug} text={artwork.description} html={details?.descriptionHtml} />}
            </section>
          )}
          <div className="mt-5 space-y-2 border-t border-border pt-4">
            <CertificateStatement className="gap-2 leading-5 tracking-[.08em]" />
            <div className="flex gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} />
              <p>One of a kind. Insured white-glove delivery is arranged and quoted privately.</p>
            </div>
          </div>
        </aside>
      </div>

      {showPurchaseBar && (
        <div className="glass-strong fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-2 p-2.5 pl-3
          md:inset-x-auto md:left-1/2 md:w-full md:max-w-[38rem] md:-translate-x-1/2 md:gap-5 md:px-5 md:py-3">
          <div className="min-w-0"><p className="truncate font-display text-base leading-tight md:text-lg">{artwork.title}</p>{price && <p className="mt-0.5 text-xs text-primary md:text-sm">{price}</p>}</div>
          <AcquisitionButton key={artwork.slug} artwork={artwork} compact />
        </div>
      )}
    </div>
  );
}
