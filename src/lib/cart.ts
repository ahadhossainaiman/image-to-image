import { useSyncExternalStore } from "react";
import { wixClient, isWixConfigured, ensureVisitorTokens } from "@/lib/wix/client";
import { formatWixImageUrl } from "@/lib/wix/types";
import { getArtwork, type Artwork } from "@/data/catalog";
import { setCartDrawerOpen } from "@/lib/cart-drawer";

const WIX_STORES_APP_ID = "1380b703-ce81-ff05-f115-39571d94dfcd";
const KEY = "thoa-cart";
const DETAILS_KEY = "thoa-cart-details";

export type CartItem = { slug: string; qty: number };

export interface CartItemDetail {
  slug: string;
  lineItemId?: string;
  productId?: string;
  title: string;
  reference: string;
  price: number | null;
  formattedPrice: string;
  image: string;
  qty: number;
}

let items: CartItem[] = [];
let detailsMap = new Map<string, CartItemDetail>();
let loaded = false;
const subs = new Set<() => void>();

function notify() {
  subs.forEach((f) => f());
}

function load() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      items = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      items = [];
    }

    try {
      const storedDetails = JSON.parse(localStorage.getItem(DETAILS_KEY) || "[]");
      detailsMap = new Map(storedDetails.map((d: CartItemDetail) => [d.slug, d]));
    } catch {
      detailsMap = new Map();
    }

    if (isWixConfigured()) {
      syncCartWithWix().catch(() => {});
    }
  }
}

function set(next: CartItem[]) {
  items = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }
  notify();
}

function saveDetails() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify(Array.from(detailsMap.values())));
    } catch {}
  }
  notify();
}

/**
 * Synchronizes the cart with Wix Headless currentCart on the server.
 */
export async function syncCartWithWix(): Promise<void> {
  if (typeof window === "undefined" || !isWixConfigured()) return;
  try {
    await ensureVisitorTokens();
    const serverCart = await wixClient.currentCart.getCurrentCart();

    if (serverCart && serverCart.lineItems) {
      const nextItems: CartItem[] = [];
      serverCart.lineItems.forEach((li: any) => {
        const catalogItemId = li.catalogReference?.catalogItemId || li._id || "";
        const slug = catalogItemId;
        const rawPrice = li.price?.amount ? parseFloat(li.price.amount) : null;
        const title = li.productName?.original || "Artwork";
        const image = formatWixImageUrl(li.image);

        nextItems.push({ slug, qty: 1 });
        detailsMap.set(slug, {
          slug,
          lineItemId: li._id,
          productId: catalogItemId,
          title,
          reference: `THOA-${catalogItemId.slice(0, 6).toUpperCase()}`,
          price: rawPrice,
          formattedPrice: li.price?.formattedAmount || (rawPrice != null ? `$${rawPrice}` : "Price on request"),
          image,
          qty: 1,
        });
      });

      items = nextItems;
      localStorage.setItem(KEY, JSON.stringify(items));
      saveDetails();
    }
  } catch (error: any) {
    if (error?.status === 404 || error?.details?.applicationError?.code === "OWNED_CART_NOT_FOUND") {
      items = [];
      detailsMap.clear();
      localStorage.setItem(KEY, "[]");
      saveDetails();
    }
  }
}

const EMPTY: CartItem[] = [];

/**
 * Basic reactive hook returning CartItem[] ({ slug, qty: 1 }).
 */
export function useCart() {
  load();
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => items,
    () => EMPTY
  );
}

/**
 * Enhanced reactive hook returning full hydrated cart items with live titles, images, and prices.
 */
export function useCartDetails(): CartItemDetail[] {
  load();
  const currentItems = useCart();

  return currentItems.map((item) => {
    const cached = detailsMap.get(item.slug);
    if (cached) return cached;

    const catalogArt = getArtwork(item.slug);
    if (catalogArt) {
      return {
        slug: item.slug,
        title: catalogArt.title,
        reference: catalogArt.reference,
        price: catalogArt.price,
        formattedPrice: catalogArt.price != null ? `$${catalogArt.price.toLocaleString()}` : "Price on request",
        image: catalogArt.images[0]?.src || "",
        qty: 1,
      };
    }

    return {
      slug: item.slug,
      title: "Singular Artwork",
      reference: `THOA-${item.slug.slice(0, 6).toUpperCase()}`,
      price: null,
      formattedPrice: "Price on request",
      image: "",
      qty: 1,
    };
  });
}

/**
 * Adds an artwork to the active cart. Capped at 1 copy (one of a kind).
 */
export const addToCart = (artworkOrSlug: string | Artwork | { slug: string; title?: string; price?: number | null; images?: Array<{ src: string }> }) => {
  load();
  const slug = typeof artworkOrSlug === "string" ? artworkOrSlug : artworkOrSlug.slug;
  if (!slug) return;

  if (!items.some((i) => i.slug === slug)) {
    set([...items, { slug, qty: 1 }]);

    if (typeof artworkOrSlug !== "string") {
      const title = artworkOrSlug.title || "Singular Artwork";
      const price = artworkOrSlug.price ?? null;
      const image = artworkOrSlug.images?.[0]?.src || "";
      const reference = (artworkOrSlug as Artwork).reference || `THOA-${slug.slice(0, 6).toUpperCase()}`;

      detailsMap.set(slug, {
        slug,
        productId: (artworkOrSlug as any).id || slug,
        title,
        reference,
        price,
        formattedPrice: price != null ? `$${price.toLocaleString()}` : "Price on request",
        image,
        qty: 1,
      });
      saveDetails();
    }

    // Sync with Wix eCommerce in background
    if (isWixConfigured() && typeof window !== "undefined") {
      (async () => {
        try {
          await ensureVisitorTokens();
          let catalogItemId = typeof artworkOrSlug !== "string" && (artworkOrSlug as any).id ? (artworkOrSlug as any).id : slug;

          if (!catalogItemId.includes("-") || catalogItemId.length < 20) {
            try {
              const productQuery = await wixClient.products.queryProducts().eq("slug", slug).limit(1).find();
              if (productQuery.items?.[0]?._id) {
                catalogItemId = productQuery.items[0]._id;
              }
            } catch {}
          }

          const res = await wixClient.currentCart.addToCurrentCart({
            lineItems: [
              {
                catalogReference: {
                  appId: WIX_STORES_APP_ID,
                  catalogItemId,
                },
                quantity: 1,
              },
            ],
          });

          if (res?.cart?.lineItems) {
            const added = res.cart.lineItems.find((li: any) => li.catalogReference?.catalogItemId === catalogItemId);
            if (added) {
              const existing = detailsMap.get(slug);
              if (existing) {
                if (added._id) existing.lineItemId = added._id;
                existing.productId = catalogItemId;
                saveDetails();
              }
            }
          }
        } catch (err) {
          console.warn("Wix Headless: add to cart sync warning:", err);
        }
      })();
    }
  }
  setCartDrawerOpen(true);
};

/**
 * Removes an artwork from the active cart.
 */
export const removeFromCart = (slug: string) => {
  load();
  const existingDetail = detailsMap.get(slug);
  const lineItemId = existingDetail?.lineItemId;

  set(items.filter((i) => i.slug !== slug));
  detailsMap.delete(slug);
  saveDetails();

  if (isWixConfigured() && lineItemId && typeof window !== "undefined") {
    (async () => {
      try {
        await ensureVisitorTokens();
        await wixClient.currentCart.removeLineItemsFromCurrentCart([lineItemId]);
      } catch (err) {
        console.warn("Wix Headless: remove cart lineItem warning:", err);
      }
    })();
  }
};
