import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCategoryBySlug, getArtworksByCategory } from "@/lib/wix";
import { ArtCard } from "@/components/ArtCard";
import { InquiryDialog } from "@/components/InquiryDialog";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const category = await getCategoryBySlug(params.slug);
    if (!category) throw notFound();
    const items = await getArtworksByCategory(category.slug);
    return { category, items };
  },
  head: ({ loaderData }) => loaderData ? { meta: [
    { title: `${loaderData.category.shortName} — Thy House Of Art` },
    { name: "description", content: loaderData.category.description },
    { property: "og:title", content: `${loaderData.category.shortName} — Thy House Of Art` },
    { property: "og:description", content: loaderData.category.description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] } : { meta: [{ title: "Collection unavailable" }, { name: "robots", content: "noindex" }] },
  component: Collection,
});

function Collection() {
  const { category, items } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-10 lg:py-24">
      <Link to="/shop" className="flex w-fit items-center gap-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground hover:text-accent"><ArrowLeft className="h-4 w-4" /> All collections</Link>
      <header className="mt-12 grid gap-8 border-b border-border pb-14 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div><p className="eyebrow">The collection</p><h1 className="mt-5 max-w-4xl text-6xl leading-[.98] sm:text-7xl">{category.name}</h1></div>
        <div className="lg:justify-self-end"><p className="max-w-md text-sm leading-7 text-muted-foreground">{category.description}</p><p className="mt-5 text-[9px] uppercase tracking-[.2em] text-primary">{items.length} {items.length === 1 ? "singular work" : "singular works"}</p></div>
      </header>
      <div className="mt-16 grid gap-x-10 gap-y-20 md:grid-cols-2">
        {items.map((artwork, index) => <ArtCard key={artwork.slug} a={artwork} priority={index === 0} className={index % 2 === 1 ? "md:mt-24" : ""} />)}
      </div>
      {items.length === 0 && <div className="glass-panel mt-16 py-24 text-center"><p className="font-display text-4xl">New works are taking shape.</p></div>}
      <div className="glass-panel mt-24 flex flex-col items-start justify-between gap-8 p-8 sm:p-12 md:flex-row md:items-center">
        <div><p className="eyebrow">A related commission</p><h2 className="mt-3 text-4xl">Let us create your own story.</h2></div>
        <InquiryDialog><button className="btn-outline-art shrink-0">Bespoke inquiry <ArrowRight className="h-4 w-4" /></button></InquiryDialog>
      </div>
    </div>
  );
}
