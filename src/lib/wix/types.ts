import { media } from "@wix/sdk";
import type { products, collections } from "@wix/stores";
import type { Artwork, ArtworkImage, ArtworkMedia, Category } from "@/data/catalog";

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

function productText(html?: string | null): string {
  if (!html) return "";
  const withLineBreaks = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\b[^>]*>|<\/(?:p|div|h[1-6]|li|tr)\s*>/gi, "\n");
  if (typeof document === "undefined") return withLineBreaks.replace(/<[^>]+>/g, "").trim();

  const template = document.createElement("template");
  template.innerHTML = withLineBreaks;
  return (template.content.textContent ?? "").trim();
}

const mediaExtension = /\.(?:jpe?g|png|webp|avif|gif|svg|bmp|apng|tiff?|heic|heif|mp4|webm|mov|m4v)$/i;

function mediaName(value?: string | null): string {
  const name = value?.trim().replace(mediaExtension, "").trim() ?? "";
  return name.toLowerCase() === "file" || /~mv\d(?:_|$)/i.test(name) ? "" : name;
}

function mediaNameFromUrl(url?: string): string {
  if (!url) return "";
  try {
    const path = new URL(url, "https://static.wixstatic.com").pathname;
    const fileName = decodeURIComponent(path.split("/").at(-1) ?? "");
    return mediaExtension.test(fileName) ? mediaName(fileName) : "";
  } catch {
    return "";
  }
}

function mapProductMedia(item: products.MediaItem, title: string): ArtworkMedia | undefined {
  const imageUrl = item.image?.url;
  if (imageUrl) {
    const name = mediaName(item.title) || mediaNameFromUrl(imageUrl);
    const width = item.image?.width;
    const height = item.image?.height;
    const thumbnail = formatWixImageUrl(item.thumbnail?.url);
    return {
      src: formatWixImageUrl(imageUrl),
      alt: item.image?.altText?.trim() || name || title,
      ...(name && { name }),
      ...(width && height && { width, height }),
      ...(thumbnail && { thumbnail }),
    };
  }

  const src = item.video?.files?.find((file) => /^https?:\/\//i.test(file.url ?? ""))?.url;
  if (!src) return undefined;
  const name = mediaName(item.title) || mediaNameFromUrl(src);
  const poster = formatWixImageUrl(item.thumbnail?.url);
  return { kind: "video", src, alt: name || title, ...(name && { name }), ...(poster && { poster }) };
}

/** Maps a Wix Stores Product to the atelier's public artwork details. */
export function mapWixProductToArtwork(p: products.Product): Artwork {
  const title = p.name?.trim() || "Untitled Artwork";
  const gallery = (p.media?.items ?? [])
    .map((item) => mapProductMedia(item, title))
    .filter((item): item is ArtworkMedia => Boolean(item));
  if (gallery.length === 0 && p.media?.mainMedia) {
    const mainMedia = mapProductMedia(p.media.mainMedia, title);
    if (mainMedia) gallery.push(mainMedia);
  }
  const images = gallery.filter((item): item is ArtworkImage => item.kind !== "video");
  const sections = (p.additionalInfoSections ?? [])
    .map((section) => ({ title: section.title?.trim() ?? "", text: productText(section.description) }))
    .filter((section) => section.title && section.text);
  const mediumSection = sections.find((section) => section.title.toLowerCase() === "medium");
  const stock = p.stock;
  let stockStatus = stock?.inventoryStatus;
  if (!stockStatus && stock) {
    if (stock.inStock === false || (stock.trackInventory && stock.quantity === 0)) stockStatus = "OUT_OF_STOCK";
    else if (stock.inStock === true) stockStatus = "IN_STOCK";
  }
  const stockLabels = {
    OUT_OF_STOCK: "Out of stock",
    IN_STOCK: "In stock",
    PARTIALLY_OUT_OF_STOCK: "Some options out of stock",
  };
  const priceData = p.priceData ?? p.price;
  const price = priceData?.discountedPrice ?? priceData?.price ?? null;
  const originalPrice = priceData?.price;
  const sku = p.sku?.trim() ?? "";
  const dimensions = p.productDimensions;
  const unit = dimensions?.unit && dimensions.unit !== "UNKNOWN_DIMENSIONS_UNIT" ? dimensions.unit.toLowerCase() : "";
  const measurements = [
    { label: "L", value: dimensions?.length },
    { label: "W", value: dimensions?.width },
    { label: "H", value: dimensions?.height },
  ].filter(({ value }) => value);

  return {
    slug: p.slug || p._id || "",
    title,
    reference: sku || `THOA-${(p._id || "").slice(0, 6).toUpperCase()}`,
    category: p.collectionIds?.[0] || "haute-artistry",
    wixCollectionIds: p.collectionIds ?? [],
    medium: mediumSection?.text ?? "",
    availability: stockStatus === "OUT_OF_STOCK" ? "acquired" : "available",
    price,
    ...(originalPrice != null && price != null && originalPrice > price && { compareAtPrice: originalPrice }),
    currency: priceData?.currency || "USD",
    intro: "",
    description: productText(p.description),
    details: [],
    images,
    wixDetails: {
      gallery,
      sku,
      brand: p.brand?.trim() ?? "",
      ribbons: [...new Set([p.ribbon?.trim(), ...(p.ribbons ?? []).map((ribbon) => ribbon.text?.trim())])]
        .filter((ribbon): ribbon is string => Boolean(ribbon)),
      stockLabel: stockStatus ? stockLabels[stockStatus] : "",
      dimensions: measurements.map(({ label, value }) => [label, value, unit].filter(Boolean).join(" ")).join(" × "),
      unitPrice: priceData?.formatted?.pricePerUnit?.trim() ?? "",
      sections: sections.filter((section) => section !== mediumSection),
      options: (p.productOptions ?? []).map((option) => ({
        name: option.name?.trim() ?? "",
        choices: (option.choices ?? [])
          .filter((choice) => choice.visible !== false)
          .map((choice) => choice.description?.trim() || choice.value?.trim() || "")
          .filter(Boolean),
      })).filter((option) => option.name && option.choices.length),
      customizationLabels: (p.customTextFields ?? []).map((field) => field.title?.trim() || "").filter(Boolean),
    },
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
  if (c._id) {
    result.wixCollectionId = c._id;
  }

  return result;
}
