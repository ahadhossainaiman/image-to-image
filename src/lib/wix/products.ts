import { wixClient, isWixConfigured } from "./client";
import { mapWixProductToArtwork, mapWixCollectionToCategory } from "./types";
import type { Artwork, Category } from "@/data/catalog";
import type { products } from "@wix/stores";

const collectionOrder = new Map([
  ["the queen collection", 0],
  ["the queen's court", 1],
  ["the queen's kingdom", 2],
  ["the mushroom woodland", 3],
]);

function collectionRank(category: Category): number {
  const name = category.shortName.toLowerCase().replace(/’/g, "'");
  if (/^(?:#\s*|category\s+)?5$/.test(name)) return 4;
  if (/^(?:#\s*|category\s+)?6$/.test(name)) return 5;
  return collectionOrder.get(name) ?? 6;
}

type WixQueryPage<T> = {
  items: T[];
  hasNext: () => boolean;
  next: () => Promise<WixQueryPage<T>>;
};

async function collectQueryItems<T>(page: WixQueryPage<T>): Promise<T[]> {
  const items = [...page.items];
  while (page.hasNext()) {
    page = await page.next();
    items.push(...page.items);
  }
  return items;
}

function orderMushroomArtworks(artworks: Artwork[]): Artwork[] {
  const numbered = artworks.flatMap((artwork, index) => {
    const code = [artwork.reference, artwork.slug, artwork.title]
      .map((value) => /^mush[\s-]*(\d+)$/i.exec(value.trim()))
      .find(Boolean);
    return code ? [{ artwork, index, number: Number(code[1]) }] : [];
  });
  const sorted = [...numbered].sort((a, b) => a.number - b.number);
  const ordered = [...artworks];
  // Keep other collections' works in their Wix positions in the combined gallery.
  numbered.forEach(({ index }, position) => {
    ordered[index] = sorted[position]!.artwork;
  });
  return ordered;
}

/**
 * Fetches all published artworks.
 */
export async function getArtworks(): Promise<Artwork[]> {
  if (!isWixConfigured()) {
    return [];
  }

  try {
    const firstPage = await wixClient.products.queryProducts().limit(100).find();
    const items = await collectQueryItems(firstPage);
    return orderMushroomArtworks(items.filter(Boolean).map(mapWixProductToArtwork).filter((a) => a.published));
  } catch (error) {
    console.warn("Wix Headless: Failed to query products:", error);
    return [];
  }
}

/** Fetches the three most recently created public works for the homepage. */
export async function getLatestArtworks(): Promise<Artwork[]> {
  if (!isWixConfigured()) return [];

  const limit = 3;
  try {
    let page = await wixClient.products.queryProducts().descending("numericId").limit(limit).find();
    const artworks: Artwork[] = [];
    for (;;) {
      const published = page.items.filter(Boolean).map(mapWixProductToArtwork).filter((artwork) => artwork.published);
      artworks.push(...published.slice(0, limit - artworks.length));
      if (artworks.length === limit || !page.hasNext()) return artworks;
      page = await page.next();
    }
  } catch (error) {
    console.warn("Wix Headless: Failed to query the latest products:", error);
    return [];
  }
}

/**
 * Fetches a single artwork by its slug.
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | undefined> {
  if (!isWixConfigured()) {
    return undefined;
  }

  try {
    const response = await wixClient.products.queryProducts().eq("slug", slug).limit(1).find();
    const product = response.items?.[0] ??
      (await wixClient.products.queryProducts().eq("_id", slug).limit(1).find()).items?.[0];
    if (!product) return undefined;

    if (product._id && product.visible !== false && product.manageVariants && !product.variants?.length) {
      try {
        const variants: NonNullable<products.Product["variants"]> = [];
        const limit = 100;
        for (let offset = 0; ; offset += limit) {
          const page = await wixClient.products.queryProductVariants(product._id, { paging: { limit, offset } });
          const batch = page.variants ?? [];
          variants.push(...batch);
          if (batch.length < limit || (page.totalResults != null && variants.length >= page.totalResults)) break;
        }
        return mapWixProductToArtwork({ ...product, variants });
      } catch (error) {
        console.warn(`Wix Headless: Error fetching variants for '${slug}':`, error);
      }
    }

    return mapWixProductToArtwork(product);
  } catch (error) {
    console.warn(`Wix Headless: Error fetching product '${slug}':`, error);
    return undefined;
  }
}

/**
 * Fetches all public collections/categories.
 */
export async function getCategories(): Promise<Category[]> {
  if (!isWixConfigured()) {
    return [];
  }

  try {
    const firstPage = await wixClient.collections.queryCollections().limit(50).find();
    const items = await collectQueryItems(firstPage);
    return items.filter(Boolean).map(mapWixCollectionToCategory)
      .filter((c) => c.published)
      .sort((a, b) => collectionRank(a) - collectionRank(b));
  } catch (error) {
    console.warn("Wix Headless: Failed to query collections:", error);
    return [];
  }
}

/**
 * Fetches a single category by its slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (!isWixConfigured()) {
    return undefined;
  }

  try {
    const response = await wixClient.collections.getCollectionBySlug(slug);
    if (response.collection) {
      return mapWixCollectionToCategory(response.collection);
    }
    return undefined;
  } catch (error) {
    console.warn(`Wix Headless: Error fetching category '${slug}':`, error);
    return undefined;
  }
}

export async function getCategoryBySlugOrId(slugOrId: string): Promise<Category | undefined> {
  const isCollectionId = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(slugOrId);
  if (!isWixConfigured() || !isCollectionId) {
    return getCategoryBySlug(slugOrId);
  }

  try {
    const collection = await wixClient.collections.getCollection(slugOrId);
    if (collection?.slug && collection.visible !== false) {
      return mapWixCollectionToCategory(collection);
    }
  } catch (error) {
    console.warn(`Wix Headless: Error fetching collection '${slugOrId}':`, error);
  }
  return undefined;
}

/**
 * Fetches all artworks within a specific collection/category.
 */
export async function getArtworksByCategory(category: Category): Promise<Artwork[]> {
  if (category.wixCollectionId && isWixConfigured()) {
    try {
      const prodResponse = await wixClient.products
        .queryProducts()
        .hasSome("collectionIds", [category.wixCollectionId])
        .limit(100)
        .find();
      const artworks = (await collectQueryItems(prodResponse)).filter(Boolean).map(mapWixProductToArtwork).filter((a) => a.published);
      return category.slug === "the-mushroom-woodlands-1" ? orderMushroomArtworks(artworks) : artworks;
    } catch (error) {
      console.warn(`Wix Headless: Error fetching artworks for category '${category.slug}':`, error);
    }
  }
  return [];
}
