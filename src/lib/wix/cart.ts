import { wixClient, isWixConfigured, ensureVisitorTokens } from "./client";

export const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

export interface WixCartItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
  image?: string;
  slug?: string;
}

/**
 * Adds an item to the Wix Headless active current cart.
 */
export async function addArtworkToWixCart(productIdOrSlug: string): Promise<boolean> {
  if (!isWixConfigured() || typeof window === "undefined") {
    return false;
  }

  try {
    await ensureVisitorTokens();

    // If given a slug, resolve its product id first
    let catalogItemId = productIdOrSlug;
    try {
      const productQuery = await wixClient.products.queryProducts().eq("slug", productIdOrSlug).limit(1).find();
      if (productQuery.items?.[0]?._id) {
        catalogItemId = productQuery.items[0]._id;
      }
    } catch {
      // Use productIdOrSlug as fallback
    }

    await wixClient.currentCart.addToCurrentCart({
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

    return true;
  } catch (error) {
    console.warn("Wix Headless: Error adding item to Wix cart:", error);
    return false;
  }
}

/**
 * Fetches the current Wix cart from the server.
 */
export async function getWixCurrentCart() {
  if (!isWixConfigured() || typeof window === "undefined") {
    return null;
  }

  try {
    await ensureVisitorTokens();
    const cart = await wixClient.currentCart.getCurrentCart();
    return cart;
  } catch (error: any) {
    // 404 simply means no items have been added to the session cart yet
    if (error?.status !== 404) {
      console.warn("Wix Headless: Error fetching current cart:", error);
    }
    return null;
  }
}

/**
 * Removes an item from the Wix current cart by line item ID.
 */
export async function removeArtworkFromWixCart(lineItemId: string): Promise<boolean> {
  if (!isWixConfigured() || typeof window === "undefined") {
    return false;
  }

  try {
    await ensureVisitorTokens();
    await wixClient.currentCart.removeLineItemsFromCurrentCart([lineItemId]);
    return true;
  } catch (error) {
    console.warn("Wix Headless: Error removing line item from Wix cart:", error);
    return false;
  }
}

