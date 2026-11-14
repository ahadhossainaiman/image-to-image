import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ChevronRight, MessageCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { getArtworkBySlug, getCategoryBySlug } from "@/lib/wix";
import type { Artwork } from "@/data/catalog";
import { addToCart, useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { InquiryDialog } from "@/components/InquiryDialog";
import { CertificateStatement } from "@/components/CertificateStatement";

export const Route = createFileRoute("/artwork/$slug")({
  loader: async ({ params }) => {
    const artwork = await getArtworkBySlug(params.slug);
    if (!artwork) throw notFound();
    const category = await getCategoryBySlug(artwork.category);
    return {
      artwork,
      category,
    };
  },
  head: ({ loaderData }) => loaderData?.artwork ? {
    meta: [
      { title: `${loaderData.artwork.title} — Thy House Of Art` },
      { name: "description", content: loaderData.artwork.intro },
      { property: "og:title", content: `${loaderData.artwork.title} — Thy House Of Art` },
      { property: "og:description", content: loaderData.artwork.intro },
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
        sku: loaderData.artwork.reference,
        brand: { "@type": "Brand", name: "Thy House Of Art" },
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

  if (artwork.price == null) {
    return (
      <InquiryDialog artwork={artwork.title}>
        <button className={compact ? "btn-art min-h-11 px-5 py-3" : "btn-art w-full"}>
          Acquire artwork <ChevronRight className="h-4 w-4" />
        </button>
      </InquiryDialog>
    );
  }
  return (
    <button
      type="button"
      className={compact ? "btn-art min-h-11 px-5 py-3 cursor-pointer" : "btn-art w-full cursor-pointer"}
      disabled={inCart || isAdding}
      onClick={handleAdd}
    >
      {isAdding ? "Reserving in cart..." : inCart ? "In your cart" : "Add to cart"} <ShoppingBag className="h-4 w-4" />
    </button>
  );
}

function ArtworkPage() {
  const { artwork, category } = Route.useLoaderData();
  const { formatPrice } = useCurrency();
  const [activeImage, setActiveImage] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  function scrollToImage(index: number) {
    const gallery = galleryRef.current;
    if (!gallery) return;
    gallery.scrollTo({ left: gallery.clientWidth * index, behavior: "smooth" });
    setActiveImage(index);
  }

  return (
    <div className="pb-24 md:pb-0">
      <div className="mx-auto max-w-[1500px] px-5 pt-7 sm:px-10 md:pt-10">
        <Link to="/collections/$slug" params={{ slug: artwork.category }} className="flex w-fit items-center gap-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> {category?.shortName ?? "The gallery"}
        </Link>
      </div>
      <div className="mx-auto mt-7 grid max-w-[1500px] md:grid-cols-[1.25fr_.75fr] md:gap-10 md:px-10 lg:gap-16">
        <div
          ref={galleryRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            if (window.innerWidth < 768) setActiveImage(Math.min(artwork.images.length - 1, Math.round(element.scrollLeft / element.clientWidth)));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto md:flex-col md:gap-8 md:overflow-visible"
        >
          {artwork.images.map((image, index) => (
            <div key={image.src} className="w-full shrink-0 snap-center md:glass-panel md:p-3">
              <img
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="aspect-[4/5] w-full object-cover md:aspect-auto"
              />
              <p className="hidden px-2 pb-2 pt-4 text-[9px] uppercase tracking-[.18em] text-muted-foreground md:block">View {String(index + 1).padStart(2, "0")} / {String(artwork.images.length).padStart(2, "0")}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2 md:hidden" aria-label="Artwork image navigation">
          {artwork.images.map((image, index) => (
            <button key={image.src} aria-label={`Show artwork image ${index + 1}`} aria-current={activeImage === index} onClick={() => scrollToImage(index)} className="p-2">
              <span className={`block h-1.5 rounded-full transition-all ${activeImage === index ? "w-7 bg-primary" : "w-1.5 bg-muted-foreground/50"}`} />
            </button>
          ))}
        </div>

        <aside className="px-5 pt-9 sm:px-10 md:sticky md:top-28 md:self-start md:px-0 md:pt-0">
          <div className="glass-panel p-7 sm:p-9">
            <div className="flex items-center justify-between gap-5">
              <p className="eyebrow">{artwork.medium}</p>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" strokeWidth={1} />
            </div>
            <h1 className="mt-5 text-5xl leading-[.98] sm:text-6xl md:text-5xl lg:text-6xl">{artwork.title}</h1>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
              <p className="text-sm text-accent">{formatPrice(artwork)}</p>
              <p className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">{artwork.reference}</p>
            </div>
            <CertificateStatement className="mt-6" />
            <p className="mt-7 font-display text-2xl italic leading-snug">{artwork.intro}</p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">{artwork.description}</p>
            <div className="mt-8 border-t border-border pt-7">
              <p className="eyebrow">The details</p>
              <ul className="mt-5 space-y-3 text-xs leading-6 text-muted-foreground">{artwork.details.map((detail) => <li key={detail} className="flex gap-3"><span className="text-primary">—</span>{detail}</li>)}</ul>
            </div>
            <div className="mt-9"><AcquisitionButton artwork={artwork} /></div>
            <InquiryDialog artwork={artwork.title}>
              <button className="mt-5 flex w-full items-center justify-center gap-2 text-[10px] uppercase tracking-[.18em] text-primary hover:text-accent"><MessageCircle className="h-4 w-4" strokeWidth={1.2} /> Bespoke inquiry</button>
            </InquiryDialog>
            <div className="mt-7 flex gap-3 border-t border-border pt-6 text-[10px] leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.1} /><p>One of a kind. Insured white-glove delivery is arranged and quoted privately.</p></div>
          </div>
        </aside>
      </div>

      <div className="glass-strong fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 p-3 pl-5 md:hidden">
        <div className="min-w-0"><p className="truncate font-display text-lg">{artwork.title}</p><p className="mt-0.5 text-[10px] text-primary">{formatPrice(artwork)}</p></div>
        <AcquisitionButton artwork={artwork} compact />
      </div>
    </div>
  );
}
