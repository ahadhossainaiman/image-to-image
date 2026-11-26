import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/currency";

describe("gallery rules", () => {
  it("formats the actual USD amount with its fractional price", () => {
    expect(formatPrice({ price: 100.75, currency: "USD" })).toBe("$100.75");
  });

  it("uses the catalog currency without relabeling the amount as USD", () => {
    expect(formatPrice({ price: 280, currency: "BDT" })).toMatch(/BDT\s*280/);
  });

  it("omits a price when Wix did not send an amount or currency", () => {
    expect(formatPrice({ price: null, currency: "USD" })).toBe("");
    expect(formatPrice({ price: 280 })).toBe("");
  });
});
