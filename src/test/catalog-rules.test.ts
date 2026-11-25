import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/currency";

describe("gallery rules", () => {
  it("formats the actual USD amount with its fractional price", () => {
    expect(formatPrice({ price: 100.75, currency: "USD" })).toBe("$100.75");
  });

  it("does not display a non-USD amount as a US dollar price", () => {
    expect(formatPrice({ price: 280, currency: "BDT" })).toBe("");
  });

  it("omits a price when Wix did not send an amount or currency", () => {
    expect(formatPrice({ price: null, currency: "USD" })).toBe("");
    expect(formatPrice({ price: 280 })).toBe("");
  });
});
