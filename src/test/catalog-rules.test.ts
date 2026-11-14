import { describe, expect, it } from "vitest";
import { publicCategories } from "@/data/catalog";
import { formatInCurrency } from "@/lib/currency";

describe("gallery rules", () => {
  it("hides unpublished category placeholders from public listings", () => {
    expect(publicCategories().map((category) => category.slug)).toEqual(["haute-artistry", "merino-mushrooms"]);
  });

  it("converts a displayed USD price into GBP", () => {
    expect(formatInCurrency({ price: 100, currency: "USD" }, "GBP")).toBe("£79");
  });

  it("keeps unpriced works on request in every display currency", () => {
    expect(formatInCurrency({ price: null, currency: "USD" }, "EUR")).toBe("Price on request");
  });
});
