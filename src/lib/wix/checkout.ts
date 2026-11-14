import { wixClient, isWixConfigured, ensureVisitorTokens } from "./client";

export interface CheckoutRedirectOptions {
  postFlowUrl?: string;
  thankYouPageUrl?: string;
  cartPageUrl?: string;
}

/**
 * Creates a Wix Checkout from the current cart and redirects the customer to Wix Hosted Checkout.
 */
export async function redirectToWixCheckout(options?: CheckoutRedirectOptions): Promise<{ url?: string; error?: string }> {
  if (typeof window === "undefined") {
    return { error: "Checkout must be initiated in the browser." };
  }

  if (!isWixConfigured()) {
    return { error: "Wix Headless is not configured yet. Please set VITE_WIX_CLIENT_ID." };
  }

  try {
    await ensureVisitorTokens();

    const baseUrl = window.location.origin;
    const postFlowUrl = options?.postFlowUrl || `${baseUrl}/cart?checkout=completed`;
    const thankYouPageUrl = options?.thankYouPageUrl || `${baseUrl}/cart?checkout=success`;
    const cartPageUrl = options?.cartPageUrl || `${baseUrl}/cart`;

    // 1. Create checkout from the current active cart
    const checkoutResult = await wixClient.currentCart.createCheckoutFromCurrentCart({
      channelType: "WEB",
    });

    const checkoutId = checkoutResult.checkoutId;
    if (!checkoutId) {
      return { error: "Unable to create Wix checkout session from current cart." };
    }

    // 2. Request a redirect URL from Wix
    const redirectResult = await wixClient.redirects.createRedirectSession({
      ecomCheckout: { checkoutId },
      callbacks: {
        postFlowUrl,
        thankYouPageUrl,
        cartPageUrl,
      },
    });

    const redirectUrl = redirectResult.redirectSession?.fullUrl;
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return { url: redirectUrl };
    }

    return { error: "No redirect URL returned by Wix Headless." };
  } catch (error: any) {
    console.error("Wix Headless: Checkout redirection error:", error);
    return { error: error?.message || "Failed to initiate Wix checkout." };
  }
}

