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

describe("Wix checkout currency", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    { currency: "BDT" },
    { currency: "USD", conversionCurrency: "BDT" },
    {},
  ])("does not create checkout for an unverified USD cart (%j)", async (cart) => {
    wix.getCart.mockResolvedValue(cart);
    expect(await redirectToWixCheckout()).toEqual({ error: "USD checkout is unavailable. Please contact the atelier." });
    expect(wix.createCheckout).not.toHaveBeenCalled();
    expect(wix.createRedirect).not.toHaveBeenCalled();
  });

  it("creates a checkout once the cart uses confirmed USD pricing", async () => {
    wix.getCart.mockResolvedValue({ currency: "USD", conversionCurrency: "USD" });
    wix.createCheckout.mockResolvedValue({ checkoutId: "checkout" });
    wix.createRedirect.mockResolvedValue({});

    await redirectToWixCheckout();
    expect(wix.createCheckout).toHaveBeenCalledWith({ channelType: "WEB" });
    expect(wix.createRedirect).toHaveBeenCalledWith(expect.objectContaining({ ecomCheckout: { checkoutId: "checkout" } }));
  });
});
