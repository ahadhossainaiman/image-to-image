import { createClient, OAuthStrategy } from "@wix/sdk";
import { collections, products } from "@wix/stores";

type CatalogEntry = { slug?: string | null; name?: string | null; visible?: boolean | null };
type CatalogPage<T> = { items: T[]; hasNext: () => boolean; next: () => Promise<CatalogPage<T>> };

async function pathsFor<T extends CatalogEntry>(path: string, page: CatalogPage<T>) {
  const paths: string[] = [];
  for (;;) {
    for (const item of page.items) {
      if (item?.visible !== false && item?.slug && item.name?.trim()) {
        paths.push(`/${path}/${encodeURIComponent(item.slug)}`);
      }
    }
    if (!page.hasNext()) return paths;
    page = await page.next();
  }
}

export async function getWixSitemapPaths(clientId: string | undefined) {
  if (!clientId?.trim()) return [];

  const client = createClient({ modules: { products, collections }, auth: OAuthStrategy({ clientId: clientId.trim() }) });
  const results = await Promise.allSettled([
    client.products.queryProducts().limit(100).find().then((page) => pathsFor("artwork", page)),
    client.collections.queryCollections().limit(50).find().then((page) => pathsFor("collections", page)),
  ]);
  return results.flatMap((result) => {
    if (result.status === "fulfilled") return result.value;
    console.warn("Wix catalog URLs could not be added to the sitemap.");
    return [];
  });
}
