import { wixClient, isWixConfigured } from "./client";
import { mapWixProductToArtwork, mapWixCollectionToCategory } from "./types";
import {
  artworks as localArtworks,
  publicCategories as localCategories,
  getArtwork as getLocalArtwork,
  getCategory as getLocalCategory,
  artworksIn as localArtworksIn,
  type Artwork,
  type Category,
} from "@/data/catalog";

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

/**
 * Fetches all published artworks.
 * Queries Wix Stores if configured; falls back cleanly to local catalog otherwise.
 */
export async function getArtworks(): Promise<Artwork[]> {
  if (!isWixConfigured()) {
    return localArtworks.filter((a) => a.published);
  }

  try {
    const firstPage = await wixClient.products.queryProducts().limit(100).find();
    const items = await collectQueryItems(firstPage);
    if (items.length > 0) {
      return items
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map(mapWixProductToArtwork)
        .filter((a) => a.published);
    }
    return localArtworks.filter((a) => a.published);
  } catch (error) {
    console.warn("Wix Headless: Failed to query products from Wix Stores, falling back to local catalog:", error);
    return localArtworks.filter((a) => a.published);
  }
}

/** Fetches the two newest public artworks for the homepage. */
export async function getLatestArtworks(): Promise<Artwork[]> {
  const limit = 2;
  if (isWixConfigured()) {
    try {
      // Wix assigns increasing numeric IDs as products are created.
      const { items } = await wixClient.products.queryProducts().descending("numericId").limit(limit).find();
      return items
        .filter((item) => item && item.visible !== false)
        .slice(0, limit)
        .map(mapWixProductToArtwork);
    } catch (error) {
      console.warn("Wix Headless: Failed to query the latest products, falling back to local catalog:", error);
    }
  }
  return localArtworks.filter((artwork) => artwork.published).slice(0, limit);
}

/**
 * Fetches a single artwork by its slug.
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | undefined> {
  if (!isWixConfigured()) {
    return getLocalArtwork(slug);
  }

  try {
    const response = await wixClient.products.queryProducts().eq("slug", slug).limit(1).find();
    const firstBySlug = response.items?.[0];
    if (firstBySlug) {
      return mapWixProductToArtwork(firstBySlug);
    }

    // Try finding by _id in case slug was an ID
    const byIdResponse = await wixClient.products.queryProducts().eq("_id", slug).limit(1).find();
    const firstById = byIdResponse.items?.[0];
    if (firstById) {
      return mapWixProductToArtwork(firstById);
    }

    // Fallback to local catalog
    return getLocalArtwork(slug);
  } catch (error) {
    console.warn(`Wix Headless: Error fetching product '${slug}', falling back:`, error);
    return getLocalArtwork(slug);
  }
}

/**
 * Fetches all public collections/categories.
 */
export async function getCategories(): Promise<Category[]> {
  if (!isWixConfigured()) {
    return localCategories();
  }

  try {
    const firstPage = await wixClient.collections.queryCollections().limit(50).find();
    const items = await collectQueryItems(firstPage);
    if (items.length > 0) {
      return items
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map(mapWixCollectionToCategory)
        .filter((c) => c.published);
    }
    return localCategories();
  } catch (error) {
    console.warn("Wix Headless: Failed to query collections, falling back to local:", error);
    return localCategories();
  }
}

/**
 * Fetches a single category by its slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (!isWixConfigured()) {
    return getLocalCategory(slug);
  }

  try {
    const response = await wixClient.collections.getCollectionBySlug(slug);
    if (response.collection) {
      return mapWixCollectionToCategory(response.collection);
    }
    return getLocalCategory(slug);
  } catch (error) {
    console.warn(`Wix Headless: Error fetching category '${slug}', falling back:`, error);
    return getLocalCategory(slug);
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
      if (prodResponse.items && prodResponse.items.length > 0) {
        return prodResponse.items
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map(mapWixProductToArtwork)
          .filter((a) => a.published);
      }
    } catch (error) {
      console.warn(`Wix Headless: Error fetching artworks for category '${category.slug}':`, error);
    }
  }
  return localArtworksIn(category.slug);
}
