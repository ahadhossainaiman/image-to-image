import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, MessageCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { getArtworkBySlug, getCategoryBySlugOrId } from "@/lib/wix";
import type { Artwork, Category } from "@/data/catalog";
import { addToCart, useCart } from "@/lib/cart";
import { formatPrice, usdPrice } from "@/lib/currency";
import { CertificateStatement } from "@/components/CertificateStatement";
import { ArtworkGallery } from "@/components/ArtworkGallery";
import { WixArtworkDetails } from "@/components/WixArtworkDetails";
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
    const categoryKeys = artwork.wixCollectionIds ?? [artwork.category];
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
  const inCart = useCart().some((item) => item.slug === artwork.slug);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd() {
    setIsAdding(true);
    await addToCart(artwork);
    setIsAdding(false);
  }

  if (usdPrice(artwork) == null) {
    return (
      <Link
        to="/contact"
        search={{ piece: artwork.title }}
        className={compact ? "btn-art min-h-11 shrink-0 gap-2 px-3 py-2 tracking-[.12em]" : "btn-art w-full"}
      >
        Acquire artwork <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={compact ? "btn-art min-h-11 shrink-0 cursor-pointer gap-2 px-3 py-2 tracking-[.12em]" : "btn-art w-full cursor-pointer"}
      disabled={inCart || isAdding}
      onClick={handleAdd}
    >
      {isAdding ? "Reserving in cart..." : inCart ? "In your cart" : "Add to cart"} <ShoppingBag className="h-4 w-4" />
    </button>
  );
}

function ArtworkPage() {
  const { artwork, categories } = Route.useLoaderData();
  const category = categories[0];
  const details = artwork.wixDetails;
  const price = formatPrice(artwork);

  return (
    <div className="pb-24 md:pb-0">
      <div className="mx-auto max-w-[1500px] px-5 pt-7 sm:px-10 md:pt-10">
        <Link
          {...(category
            ? { to: "/collections/$slug", params: { slug: category.slug } } as const
            : { to: "/shop" } as const)}
          preload="intent"
          className="flex w-fit items-center gap-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> {category?.shortName ?? "The gallery"}
        </Link>
      </div>
      <div className="mx-auto mt-4 grid max-w-[1500px] md:mt-7 md:grid-cols-[1.25fr_.75fr] md:gap-10 md:px-10 lg:gap-16">
        <ArtworkGallery key={artwork.slug} items={details?.gallery ?? artwork.images} />

        <aside className="min-w-0 px-5 pt-5 sm:px-10 md:sticky md:top-28 md:self-start md:px-0 md:pt-0">
          <div className="glass-panel p-4 sm:p-6 md:p-7 lg:p-9">
            {artwork.medium && (
              <div className="mb-3 flex items-center justify-between gap-3 md:mb-5 md:gap-5">
                <p className="eyebrow">{artwork.medium}</p>
                <Sparkles className="h-4 w-4 shrink-0 text-primary" strokeWidth={1} />
              </div>
            )}
            <h1 className="text-3xl leading-[1.1] [overflow-wrap:anywhere] sm:text-4xl md:text-5xl md:leading-[.98] lg:text-6xl">{artwork.title}</h1>
            {details && details.ribbons.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Product ribbons">
                {details.ribbons.map((ribbon) => (
                  <li key={ribbon} className="rounded-full border border-primary/40 px-3 py-1 text-xs text-accent">{ribbon}</li>
                ))}
              </ul>
            )}
            {price && (
              <div className="mt-3 border-b border-border pb-4 md:mt-5 md:pb-6">
                <p className="text-base text-accent md:text-lg">{price}</p>
                {details?.unitPrice && <p className="mt-1 text-xs text-muted-foreground">{details.unitPrice}</p>}
              </div>
            )}
            <CertificateStatement className="mt-4 gap-2 leading-5 tracking-[.1em] md:mt-6 md:gap-3 md:leading-6 md:tracking-[.15em]" />
            {artwork.intro && <p className="mt-5 font-display text-lg italic leading-snug md:mt-7 md:text-2xl">{artwork.intro}</p>}
            {artwork.description && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere] md:mt-5 md:leading-7">{artwork.description}</p>}
            {details && <WixArtworkDetails details={details} categories={categories} />}
            {artwork.details.length > 0 && (
              <div className="mt-5 border-t border-border pt-4 md:mt-8 md:pt-7">
                <p className="eyebrow">The details</p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground md:mt-5 md:space-y-3 md:leading-6">{artwork.details.map((detail) => <li key={detail} className="flex gap-3"><span className="text-primary">—</span>{detail}</li>)}</ul>
              </div>
            )}
            <div className="mt-6 md:mt-9"><AcquisitionButton artwork={artwork} /></div>
            <Link
              to="/contact"
              search={{ piece: artwork.title }}
              className="mt-5 flex w-full items-center justify-center gap-2 text-[10px] uppercase tracking-[.18em] text-primary hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.2} /> Bespoke inquiry
            </Link>
            <div className="mt-5 flex gap-3 border-t border-border pt-4 text-xs leading-5 text-muted-foreground md:mt-7 md:pt-6"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><p>One of a kind. Insured white-glove delivery is arranged and quoted privately.</p></div>
          </div>
        </aside>
      </div>

      <div className="glass-strong fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-2 p-2.5 pl-3 md:hidden">
        <div className="min-w-0"><p className="truncate font-display text-base leading-tight">{artwork.title}</p>{price && <p className="mt-0.5 text-xs text-primary">{price}</p>}</div>
        <AcquisitionButton artwork={artwork} compact />
      </div>
    </div>
  );
}
