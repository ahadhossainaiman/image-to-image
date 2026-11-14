import { media } from "@wix/sdk";
import type { products, collections } from "@wix/stores";
import type { Artwork, Category } from "@/data/catalog";

/**
 * Transforms a raw Wix media URL (e.g. wix:image://...) into a public high-resolution CDN URL.
 */
export function formatWixImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/")) {
    return rawUrl;
  }
  if (rawUrl.startsWith("wix:image://")) {
    try {
      const transformed = media.getImageUrl(rawUrl);
      return transformed.url || rawUrl;
    } catch {
      return rawUrl;
    }
  }
  return rawUrl;
}

/**
 * Maps a Wix Stores Product entity to the atelier's Artwork interface.
 */
export function mapWixProductToArtwork(p: products.Product): Artwork {
  const images = (p.media?.items || [])
    .map((item) => {
      const src = formatWixImageUrl(item.image?.url);
      const alt = item.title || item.image?.altText || p.name || "Handcrafted artwork";
      return { src, alt };
    })
    .filter((img) => Boolean(img.src));

  // If no media items found but mainMedia exists
  if (images.length === 0 && p.media?.mainMedia?.image?.url) {
    images.push({
      src: formatWixImageUrl(p.media.mainMedia.image.url),
      alt: p.media.mainMedia.title || p.name || "Handcrafted artwork",
    });
  }

  // Extract medium or custom sections from additionalInfoSections
  const mediumSection = p.additionalInfoSections?.find(
    (sec) => sec.title?.toLowerCase() === "medium" || sec.title?.toLowerCase() === "materials"
  );
  const medium = mediumSection?.description || "Mixed-media bespoke sculpture";

  const details = (p.additionalInfoSections || [])
    .filter((sec) => sec.title?.toLowerCase() !== "medium")
    .map((sec) => `${sec.title}: ${sec.description?.replace(/<[^>]+>/g, "").trim()}`)
    .filter((text) => text.length > 0);

  // If details array is empty, provide default fine-art guarantees
  if (details.length === 0) {
    details.push(
      "One-of-a-kind handmade sculpture",
      "Certificate of Authenticity included with final acquisition"
    );
  }

  const isOutOfStock =
    p.stock?.inventoryStatus === "OUT_OF_STOCK" ||
    (Boolean(p.stock?.trackInventory) && (p.stock?.quantity ?? 0) <= 0);

  return {
    slug: p.slug || p._id || "",
    title: p.name || "Untitled Artwork",
    reference: p.sku || `THOA-${(p._id || "").slice(0, 6).toUpperCase()}`,
    category: p.collectionIds?.[0] || "haute-artistry",
    medium,
    availability: isOutOfStock ? "acquired" : "available",
    price: p.priceData?.price ?? null,
    currency: p.priceData?.currency || "USD",
    intro: p.ribbon || "A singular presence, shaped by hand.",
    description: (p.description || "").replace(/<[^>]+>/g, " ").trim(),
    details,
    images: images.length > 0 ? images : [{ src: "", alt: p.name || "Artwork" }],
    published: p.visible ?? true,
  };
}

/**
 * Maps a Wix Stores Collection entity to the atelier's Category interface.
 */
export function mapWixCollectionToCategory(c: collections.Collection): Category {
  const imageUrl = formatWixImageUrl(c.media?.mainMedia?.image?.url);
  const result: Category = {
    slug: c.slug || c._id || "",
    name: c.name || "Collection",
    shortName: c.name?.split("—")[0]?.trim() || c.name || "Collection",
    description: (c.description || "").replace(/<[^>]+>/g, " ").trim() || "Singular works from the atelier.",
    published: c.visible ?? true,
  };

  if (imageUrl) {
    result.image = imageUrl;
  }

  return result;
}
