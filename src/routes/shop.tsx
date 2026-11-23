import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { getArtworks, getCategories } from "@/lib/wix";
import { ArtCardGrid } from "@/components/ArtCardGrid";
import { CatalogLoading } from "@/components/CatalogLoading";
import { getPageHead } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  pendingComponent: () => <CatalogLoading page="shop" />,
  pendingMs: 160,
  pendingMinMs: 180,
  staleTime: 30_000,
  preloadStaleTime: 30_000,
  loader: async () => {
    const [artworks, categories] = await Promise.all([
      getArtworks(),
      getCategories(),
    ]);
    return { artworks, categories };
  },
  head: () => getPageHead("/shop"),
  component: Shop,
});

function Shop() {
  const { artworks, categories } = Route.useLoaderData();
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [availability, setAvailability] = useState("all");
  const selectedCategory = categories.find((category) => category.slug === categorySlug);
  const filtered = useMemo(() => artworks.filter((artwork) => {
    if (!artwork.published) return false;
    if (selectedCategory) {
      const belongsToCollection = selectedCategory.wixCollectionId
        ? artwork.wixCollectionIds?.includes(selectedCategory.wixCollectionId)
        : artwork.category === selectedCategory.slug;
      if (!belongsToCollection) return false;
    }
    if (availability === "available" && artwork.availability !== "available") return false;
    if (availability === "request" && artwork.price != null) return false;
    return true;
  }), [artworks, selectedCategory, availability]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 pt-8 pb-4 sm:px-10 md:pt-16 md:pb-16 lg:pt-24">
      <header className="grid gap-3 border-b border-border pb-5 md:gap-8 md:pb-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <p className="eyebrow">The gallery</p>
          <h1 className="mt-3 max-w-4xl text-[clamp(2.5rem,9vw,3.75rem)] md:mt-5 leading-[.95] sm:text-7xl lg:text-8xl">Singular works,<br /><em className="text-accent">quietly extraordinary.</em></h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:leading-7 lg:justify-self-end">Each piece is made once, by hand. Enter a collection to discover its textures, details and story.</p>
      </header>

      <section className="glass-panel mt-4 p-3 sm:p-6 md:mt-10" aria-label="Gallery filters">
        <div className="flex items-center gap-3 border-b border-border pb-3 md:pb-5"><SlidersHorizontal className="h-4 w-4 text-primary" strokeWidth={1.2} /><p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Curate your view</p></div>
        <div className="mt-3 grid gap-4 md:mt-5 md:gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-2 text-[9px] md:mb-3 uppercase tracking-[.2em] text-muted-foreground">By collection & medium</p>
            <div className="flex flex-wrap gap-2">
              <button className="filter-pill" data-active={!selectedCategory} aria-pressed={!selectedCategory} onClick={() => setCategorySlug(null)}>All works</button>
              {categories.map((item) => (
                <button
                  key={item.slug}
                  className="filter-pill"
                  data-active={selectedCategory === item}
                  aria-pressed={selectedCategory === item}
                  onClick={() => setCategorySlug(item.slug)}
                >
                  {item.shortName}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[9px] md:mb-3 uppercase tracking-[.2em] text-muted-foreground">Availability</p>
            <div className="flex flex-wrap gap-2">
              <button className="filter-pill" data-active={availability === "all"} onClick={() => setAvailability("all")}>All</button>
              <button className="filter-pill" data-active={availability === "available"} onClick={() => setAvailability("available")}>Available</button>
              <button className="filter-pill" data-active={availability === "request"} onClick={() => setAvailability("request")}>Price on request</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 flex md:mt-12 items-center justify-between">
        <p className="text-xs text-muted-foreground" aria-live="polite">Showing {filtered.length} {filtered.length === 1 ? "work" : "works"}</p>
        <p className="hidden text-[9px] uppercase tracking-[.2em] text-primary sm:block">Every artwork is one of one</p>
      </div>
      {filtered.length > 0 ? (
        <ArtCardGrid artworks={filtered} />
      ) : (
        <div className="glass-panel mt-3 px-3 py-8 text-center md:mt-8 md:py-24"><p className="font-display text-3xl sm:text-4xl">No works in this view</p><button className="btn-outline-art mt-4 sm:mt-7" onClick={() => { setCategorySlug(null); setAvailability("all"); }}>Clear filters</button></div>
      )}
    </div>
  );
}
