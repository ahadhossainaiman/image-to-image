import { useSyncExternalStore } from "react";
import { wixClient, isWixConfigured, ensureVisitorTokens, saveWixTokens } from "@/lib/wix/client";
import { formatWixImageUrl } from "@/lib/wix/types";
import { WIX_STORES_APP_ID } from "@/lib/wix/cart";
import type { Artwork } from "@/data/catalog";
import { formatPrice } from "@/lib/currency";
import { setCartDrawerOpen } from "@/lib/cart-drawer";

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
  currency?: string | undefined;
  formattedPrice: string;
  image: string;
  qty: number;
}

let items: CartItem[] = [];
type StoredCartDetail = Omit<CartItemDetail, "formattedPrice">;
let detailsMap = new Map<string, StoredCartDetail>();
let loaded = false;
let cartQueue: Promise<unknown> = Promise.resolve();
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
      detailsMap = new Map(storedDetails
        .filter((detail: StoredCartDetail) => !("formattedPrice" in detail))
        .map((detail: StoredCartDetail) => [detail.slug, detail]));
    } catch {
      detailsMap = new Map();
    }

    if (isWixConfigured()) {
      cartQueue = syncCartWithWix();
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
    saveWixTokens(wixClient.auth.getTokens());

    if (serverCart && serverCart.lineItems) {
      const nextItems: CartItem[] = [];
      const nextDetails = new Map<string, StoredCartDetail>();
      const knownSlugs = new Map([...detailsMap.values()].map((item) => [item.productId, item.slug]));
      serverCart.lineItems.forEach((li) => {
        const catalogItemId = li.catalogReference?.catalogItemId;
        if (!catalogItemId || !li._id) return;
        const slug = knownSlugs.get(catalogItemId) ?? catalogItemId;
        const rawPrice = li.price?.amount ? parseFloat(li.price.amount) : null;
        const title = li.productName?.original ?? "";
        const image = formatWixImageUrl(li.image);

        nextItems.push({ slug, qty: 1 });
        nextDetails.set(slug, {
          slug,
          lineItemId: li._id,
          productId: catalogItemId,
          title,
          reference: li.physicalProperties?.sku ?? "",
          price: rawPrice,
          currency: serverCart.currency,
          image,
          qty: 1,
        });
      });

      items = nextItems;
      detailsMap = nextDetails;
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
    if (cached) return { ...cached, formattedPrice: formatPrice(cached) };

    return {
      slug: item.slug,
      title: "",
      reference: "",
      price: null,
      formattedPrice: "",
      image: "",
      qty: 1,
    };
  });
}

/**
 * Adds an artwork to the active cart. Capped at 1 copy (one of a kind).
 */
type CartArtwork = Pick<Artwork, "slug"> & Partial<Pick<Artwork, "wixProductId" | "title" | "price" | "currency" | "reference" | "images">>;

export function addToCart(artworkOrSlug: string | CartArtwork): Promise<boolean> {
  load();
  const artwork = typeof artworkOrSlug === "string" ? { slug: artworkOrSlug } : artworkOrSlug;
  const { slug } = artwork;
  if (!slug) return Promise.resolve(false);

  function saveItem(detail: Partial<StoredCartDetail> = {}) {
    detailsMap.set(slug, {
      slug,
      title: artwork.title ?? "",
      reference: artwork.reference ?? "",
      price: artwork.price ?? null,
      currency: artwork.currency,
      image: artwork.images?.[0]?.src ?? "",
      qty: 1,
      ...detail,
    });
    set([...items.filter((item) => item.slug !== slug), { slug, qty: 1 }]);
    saveDetails();
  }

  if (!isWixConfigured() || typeof window === "undefined") {
    if (!items.some((item) => item.slug === slug)) saveItem();
    setCartDrawerOpen(true);
    return Promise.resolve(true);
  }

  const operation = cartQueue.then(async () => {
    let productId = artwork.wixProductId || detailsMap.get(slug)?.productId;
    const inWixCart = () => items.some((item) => {
      const detail = detailsMap.get(item.slug);
      return Boolean(detail?.lineItemId && (item.slug === slug || (productId && detail.productId === productId)));
    });

    try {
      if (!inWixCart()) {
        await ensureVisitorTokens();
        if (!productId) {
          const result = await wixClient.products.queryProducts().eq("slug", slug).limit(1).find();
          productId = result.items[0]?._id;
        }
        if (!productId) return false;
        if (!inWixCart()) {
          const result = await wixClient.currentCart.addToCurrentCart({
            lineItems: [{ catalogReference: { appId: WIX_STORES_APP_ID, catalogItemId: productId }, quantity: 1 }],
          });
          const line = result.cart?.lineItems?.find((item) => item.catalogReference?.catalogItemId === productId);
          if (!line?._id) throw new Error("Wix did not return the added line item.");
          saveWixTokens(wixClient.auth.getTokens());
          const amount = Number.parseFloat(line.price?.amount ?? "");
          saveItem({
            lineItemId: line._id,
            productId,
            ...(Number.isFinite(amount) && { price: amount, currency: result.cart?.currency ?? artwork.currency }),
          });
        }
      }
    } catch (error) {
      console.warn("Wix Headless: Could not add the product to the cart:", error);
      await syncCartWithWix();
      if (!inWixCart()) return false;
    }

    setCartDrawerOpen(true);
    return true;
  });
  cartQueue = operation.catch(() => {});
  return operation;
}

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
