import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCategoryBySlugOrId, getArtworksByCategory } from "@/lib/wix";
import { ArtCardGrid } from "@/components/ArtCardGrid";
import { CatalogLoading } from "@/components/CatalogLoading";
import { catalogCanonical } from "@/lib/seo";

export const Route = createFileRoute("/collections/$slug")({
  pendingComponent: () => <CatalogLoading page="collection" />,
  pendingMs: 160,
  pendingMinMs: 180,
  staleTime: 30_000,
  preloadStaleTime: 30_000,
  loader: async ({ params, location }) => {
    const category = await getCategoryBySlugOrId(params.slug);
    if (!category?.published) throw notFound();
    if (category.slug !== params.slug) {
      throw redirect({
        to: "/collections/$slug",
        params: { slug: category.slug },
        search: true,
        hash: location.hash,
        replace: true,
      });
    }
    const items = await getArtworksByCategory(category);
    return { category, items };
  },
  head: ({ loaderData }) => loaderData ? {
    links: [{ rel: "canonical", href: catalogCanonical("/collections", loaderData.category.slug) }],
    meta: [
    { title: `${loaderData.category.shortName} — Thy House Of Art` },
    ...(loaderData.category.description ? [{ name: "description", content: loaderData.category.description }] : []),
    { property: "og:title", content: `${loaderData.category.shortName} — Thy House Of Art` },
    ...(loaderData.category.description ? [{ property: "og:description", content: loaderData.category.description }] : []),
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] } : { meta: [{ title: "Collection unavailable" }, { name: "robots", content: "noindex" }] },
  component: Collection,
});

function Collection() {
  const { category, items } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-[75rem] px-4 py-8 sm:px-8 md:py-14 lg:py-20">
      <Link to="/shop" preload="intent" className="flex w-fit items-center gap-3 text-[9px] uppercase tracking-[.2em] text-muted-foreground hover:text-accent lg:text-sm"><ArrowLeft className="h-4 w-4" /> All collections</Link>
      <header className="mt-7 border-b border-border pb-6 md:mt-10 md:pb-9">
        <p className="eyebrow lg:text-sm">The collection</p>
        <h1 className="mt-3 text-[clamp(3rem,7vw,6rem)] leading-[.98] [overflow-wrap:anywhere] md:mt-4">{category.name}</h1>
        {category.description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:mt-4 md:leading-7">{category.description}</p>}
        <p className="mt-4 text-[9px] uppercase tracking-[.2em] text-primary lg:text-sm">{items.length} {items.length === 1 ? "singular work" : "singular works"}</p>
      </header>
      {items.length > 0 ? (
        <ArtCardGrid artworks={items} />
      ) : (
        <div className="glass-panel mt-16 py-24 text-center"><p className="font-display text-4xl">New works are taking shape.</p></div>
      )}
      <div className="glass-panel mt-9 flex flex-col items-start justify-between gap-5 p-5 sm:p-8 md:mt-14 md:flex-row md:items-center">
        <div><p className="eyebrow">A related commission</p><h2 className="mt-3 text-4xl">Let us create your own story.</h2></div>
        <Link to="/contact" className="btn-outline-art shrink-0">Bespoke inquiry <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
