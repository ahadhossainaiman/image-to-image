import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { getArtworks, getCategories } from "@/lib/wix";
import { ArtCard } from "@/components/ArtCard";

export const Route = createFileRoute("/shop")({
  loader: async () => {
    const [artworks, categories] = await Promise.all([
      getArtworks(),
      getCategories(),
    ]);
    return { artworks, categories };
  },
  head: () => ({ meta: [
    { title: "The Gallery — Thy House Of Art" },
    { name: "description", content: "Explore one-of-a-kind celestial sculptures and hand-embroidered merino wool artworks from Thy House Of Art." },
    { property: "og:title", content: "The Gallery — Thy House Of Art" },
    { property: "og:description", content: "Browse singular handmade works from the enchanted atelier." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Shop,
});

function Shop() {
  const { artworks, categories } = Route.useLoaderData();
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const filtered = useMemo(() => artworks.filter((artwork) => {
    if (!artwork.published) return false;
    if (category !== "all" && artwork.category !== category) return false;
    if (availability === "available" && artwork.availability !== "available") return false;
    if (availability === "request" && artwork.price != null) return false;
    return true;
  }), [artworks, category, availability]);

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-16 pt-16 sm:px-10 lg:pt-24">
      <header className="grid gap-8 border-b border-border pb-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <p className="eyebrow">The gallery</p>
          <h1 className="mt-5 max-w-4xl text-6xl leading-[.95] sm:text-7xl lg:text-8xl">Singular works,<br /><em className="text-accent">quietly extraordinary.</em></h1>
        </div>
        <p className="max-w-md text-sm leading-7 text-muted-foreground lg:justify-self-end">Each piece is made once, by hand. Enter a collection to discover its textures, details and story.</p>
      </header>

      <section className="glass-panel mt-10 p-5 sm:p-6" aria-label="Gallery filters">
        <div className="flex items-center gap-3 border-b border-border pb-5"><SlidersHorizontal className="h-4 w-4 text-primary" strokeWidth={1.2} /><p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Curate your view</p></div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground">By collection & medium</p>
            <div className="flex flex-wrap gap-2">
              <button className="filter-pill" data-active={category === "all"} onClick={() => setCategory("all")}>All works</button>
              {categories.map((item) => <button key={item.slug} className="filter-pill" data-active={category === item.slug} onClick={() => setCategory(item.slug)}>{item.shortName}</button>)}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground">Availability</p>
            <div className="flex flex-wrap gap-2">
              <button className="filter-pill" data-active={availability === "all"} onClick={() => setAvailability("all")}>All</button>
              <button className="filter-pill" data-active={availability === "available"} onClick={() => setAvailability("available")}>Available</button>
              <button className="filter-pill" data-active={availability === "request"} onClick={() => setAvailability("request")}>Price on request</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Showing {filtered.length} {filtered.length === 1 ? "work" : "works"}</p>
        <p className="hidden text-[9px] uppercase tracking-[.2em] text-primary sm:block">Every artwork is one of one</p>
      </div>
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-x-10 gap-y-20 md:grid-cols-2">
          {filtered.map((artwork, index) => <ArtCard key={artwork.slug} a={artwork} priority={index < 2} className={index % 2 === 1 ? "md:mt-24" : ""} />)}
        </div>
      ) : (
        <div className="glass-panel mt-8 py-24 text-center"><p className="font-display text-4xl">No works in this view</p><button className="btn-outline-art mt-7" onClick={() => { setCategory("all"); setAvailability("all"); }}>Clear filters</button></div>
      )}
    </div>
  );
}
