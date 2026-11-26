import { media } from "@wix/sdk";
import type { products, collections } from "@wix/stores";
import type { Artwork, ArtworkImage, ArtworkMedia, Category } from "@/data/catalog";
import { formatPrice } from "@/lib/currency";

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

function productDimensions(dimensions?: products.Product["productDimensions"]): string {
  const unit = dimensions?.unit && dimensions.unit !== "UNKNOWN_DIMENSIONS_UNIT" ? dimensions.unit.toLowerCase() : "";
  return [
    { label: "L", value: dimensions?.length },
    { label: "W", value: dimensions?.width },
    { label: "H", value: dimensions?.height },
  ]
    .filter(({ value }) => value && Number(value) > 0)
    .map(({ label, value }) => [label, value, unit].filter(Boolean).join(" "))
    .join(" × ");
}

function measurement(quantity?: number, unit?: string): string {
  if (!quantity || quantity <= 0 || !unit || unit === "UNSPECIFIED") return "";
  const symbols: Record<string, string> = { ML: "mL", CL: "cL", L: "L", CBM: "m³", SQM: "m²", FLOZ: "fl oz", SQFT: "ft²" };
  return `${quantity} ${symbols[unit] ?? unit.toLowerCase()}`;
}

function priceDetails(data?: products.Product["priceData"], units?: products.Product["pricePerUnitData"], currency = data?.currency) {
  const amount = data?.discountedPrice ?? data?.price ?? null;
  const current = formatPrice({ price: amount, currency });
  const regular = data?.price != null && amount != null && data.price > amount && current
    ? formatPrice({ price: data.price, currency })
    : "";
  const unitAmount = formatPrice({ price: data?.pricePerUnit ?? null, currency });
  const base = measurement(units?.baseQuantity, units?.baseMeasurementUnit);
  const unitPrice = data?.formatted?.pricePerUnit?.trim() || (unitAmount && base ? `${unitAmount} / ${base}` : "");
  return { amount, current, regular, unitPrice };
}

/** Maps a Wix Stores Product to the atelier's public artwork details. */
export function mapWixProductToArtwork(p: products.Product): Artwork {
  const slug = p.slug || p._id || "";
  const title = p.name?.trim() ?? "";
  const gallery = (p.media?.items ?? [])
    .map((item) => mapProductMedia(item, title))
    .filter((item): item is ArtworkMedia => Boolean(item));
  if (gallery.length === 0 && p.media?.mainMedia) {
    const mainMedia = mapProductMedia(p.media.mainMedia, title);
    if (mainMedia) gallery.push(mainMedia);
  }
  const images = gallery.filter((item): item is ArtworkImage => item.kind !== "video");
  const sections = (p.additionalInfoSections ?? [])
    .map((section) => ({
      title: section.title?.trim() ?? "",
      text: productText(section.description),
      ...(section.description && { html: section.description }),
    }))
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
  const currency = priceData?.currency?.trim().toUpperCase() ?? "";
  const pricing = priceDetails(priceData, p.pricePerUnitData);
  const sku = p.sku?.trim() ?? "";
  const visibleVariants = (p.variants ?? []).flatMap(({ choices, variant, stock: variantStock }) => {
    if (variant?.visible === false) return [];
    const selected = Object.entries(choices ?? {}).filter(([option, value]) => option.trim() && value.trim());
    if (selected.length === 0) return [];
    const labels = selected.map(([option, value]) => {
      const choice = p.productOptions?.find(({ name }) => name === option)?.choices
        ?.find((entry) => entry.value === value || entry.description === value);
      if (choice?.visible === false) return "";
      return `${option.trim()}: ${choice?.description?.trim() || value.trim()}`;
    });
    if (labels.some((label) => !label)) return [];
    const variantPricing = priceDetails(variant?.priceData, p.pricePerUnitData, variant?.priceData?.currency || currency);
    const stockQuantity = variantStock?.trackQuantity && variantStock.quantity != null ? variantStock.quantity : undefined;
    const inStock = stockQuantity != null ? stockQuantity > 0 : variantStock?.inStock;
    return [{
      name: labels.join(" / "),
      price: variantPricing.current,
      regularPrice: variantPricing.regular,
      unitPrice: variantPricing.unitPrice,
      sku: variant?.sku?.trim() ?? "",
      dimensions: productDimensions(variant?.productDimensions),
      packageDimensions: productDimensions(variant?.packageDimensions),
      ...(variant?.weight && variant.weight > 0 && { weight: variant.weight }),
      stockLabel: inStock == null ? "" : inStock ? stockLabels.IN_STOCK : stockLabels.OUT_OF_STOCK,
      ...(stockQuantity != null && { stockQuantity }),
      amount: variantPricing.amount,
      currency: (variant?.priceData?.currency || currency).trim().toUpperCase(),
    }];
  });
  const variantAmounts = visibleVariants.flatMap(({ price, amount, currency: variantCurrency }) =>
    price && amount != null && variantCurrency === currency ? [amount] : [],
  );
  // Wix can send the sale and regular prices as a range on products without variants.
  const catalogRange = p.manageVariants && !p.variants?.length ? p.priceRange : undefined;
  const min = variantAmounts.length ? Math.min(...variantAmounts) : catalogRange?.minValue ?? null;
  const max = variantAmounts.length ? Math.max(...variantAmounts) : catalogRange?.maxValue ?? null;
  const minPrice = formatPrice({ price: min, currency });
  const maxPrice = formatPrice({ price: max, currency });

  return {
    slug,
    ...(p._id && { wixProductId: p._id }),
    title,
    reference: sku,
    category: p.collectionIds?.[0] ?? "",
    wixCollectionIds: p.collectionIds ?? [],
    medium: mediumSection?.text ?? "",
    availability: stockStatus === "OUT_OF_STOCK" ? "acquired" : "available",
    price: pricing.amount,
    currency,
    intro: "",
    description: productText(p.description),
    details: [],
    images,
    wixDetails: {
      gallery,
      ...(p.description && { descriptionHtml: p.description }),
      sku,
      brand: p.brand?.trim() ?? "",
      ribbons: [...new Set([p.ribbon?.trim(), ...(p.ribbons ?? []).map((ribbon) => ribbon.text?.trim())])]
        .filter((ribbon): ribbon is string => Boolean(ribbon)),
      stockLabel: stockStatus ? stockLabels[stockStatus] : "",
      dimensions: productDimensions(p.productDimensions),
      packageDimensions: productDimensions(p.packageDimensions),
      ...(p.weight && p.weight > 0 && { weight: p.weight }),
      ...(stock?.trackInventory && stock.quantity != null && { stockQuantity: stock.quantity }),
      ...(p.productType === "physical" && { productType: "Physical" }),
      ...(p.productType === "digital" && { productType: "Digital" }),
      requiresPurchaseOptions: Boolean(p.manageVariants || p.productOptions?.some((option) => option.choices?.some((choice) => choice.visible !== false)) || p.customTextFields?.some((field) => field.mandatory)),
      regularPrice: pricing.regular,
      priceRange: minPrice && maxPrice && min !== null && max !== null && max > min ? `${minPrice}–${maxPrice}` : "",
      unitPrice: pricing.unitPrice,
      unitQuantity: measurement(p.pricePerUnitData?.totalQuantity, p.pricePerUnitData?.totalMeasurementUnit),
      sections: sections.filter((section) => section !== mediumSection),
      options: (p.productOptions ?? []).map((option) => ({
        name: option.name?.trim() ?? "",
        choices: (option.choices ?? [])
          .filter((choice) => choice.visible !== false)
          .map((choice) => choice.description?.trim() || choice.value?.trim() || "")
          .filter(Boolean),
      })).filter((option) => option.name && option.choices.length),
      variants: visibleVariants.map(({ amount: _amount, currency: _currency, ...variant }) => variant),
      customizations: (p.customTextFields ?? [])
        .map((field) => ({ ...field, title: field.title?.trim() ?? "" }))
        .filter((field) => field.title),
    },
    published: p.visible !== false && Boolean(slug && title),
  };
}

/**
 * Maps a Wix Stores Collection entity to the atelier's Category interface.
 */
export function mapWixCollectionToCategory(c: collections.Collection): Category {
  const slug = c.slug || c._id || "";
  const imageUrl = formatWixImageUrl(c.media?.mainMedia?.image?.url);
  const name = c.name?.trim().replace(/^The Mushroom Woodlands(?=\s*(?:[—–-]|$))/i, "The Mushroom Woodland") ?? "";
  const result: Category = {
    slug,
    name,
    shortName: name.split("—")[0]?.trim() || name,
    description: productText(c.description),
    published: c.visible !== false && Boolean(slug && name),
  };

  if (imageUrl) {
    result.image = imageUrl;
  }
  if (c._id) {
    result.wixCollectionId = c._id;
  }

  return result;
}
