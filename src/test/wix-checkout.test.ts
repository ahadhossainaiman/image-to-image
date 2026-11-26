import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirectToWixCheckout } from "@/lib/wix/checkout";

const wix = vi.hoisted(() => ({
  getCart: vi.fn(),
  createCheckout: vi.fn(),
  createRedirect: vi.fn(),
}));

vi.mock("@/lib/wix/client", () => ({
  isWixConfigured: () => true,
  ensureVisitorTokens: async () => undefined,
  wixClient: {
    currentCart: { getCurrentCart: wix.getCart, createCheckoutFromCurrentCart: wix.createCheckout },
    redirects: { createRedirectSession: wix.createRedirect },
  },
}));

describe("Wix Hosted Checkout", () => {
  beforeEach(() => vi.resetAllMocks());

  it("does not create checkout for an empty Wix cart", async () => {
    wix.getCart.mockResolvedValue({ currency: "BDT", lineItems: [] });
    expect(await redirectToWixCheckout()).toEqual({ error: "Your cart is empty. Add an artwork before checking out." });
    expect(wix.createCheckout).not.toHaveBeenCalled();
    expect(wix.createRedirect).not.toHaveBeenCalled();
  });

  it.each(["BDT", "USD"])("creates hosted checkout for a %s cart", async (currency) => {
    wix.getCart.mockResolvedValue({ currency, lineItems: [{ _id: "cart-line" }] });
    wix.createCheckout.mockResolvedValue({ checkoutId: "checkout" });
    wix.createRedirect.mockResolvedValue({});

    expect(await redirectToWixCheckout()).toEqual({ error: "No redirect URL returned by Wix Headless." });
    expect(wix.createCheckout).toHaveBeenCalledWith({ channelType: "WEB" });
    expect(wix.createRedirect).toHaveBeenCalledWith({
      ecomCheckout: { checkoutId: "checkout" },
      callbacks: {
        postFlowUrl: `${window.location.origin}/cart?checkout=completed`,
        thankYouPageUrl: `${window.location.origin}/cart?checkout=success`,
        cartPageUrl: `${window.location.origin}/cart`,
      },
    });
  });
});
