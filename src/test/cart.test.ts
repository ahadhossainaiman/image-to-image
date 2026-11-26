import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addToCart, removeFromCart, useCart } from "@/lib/cart";

vi.mock("@/lib/wix/client", () => ({ isWixConfigured: () => false }));

const slug = "sample-celestial-angel";

afterEach(() => {
  act(() => removeFromCart(slug));
});

describe("one-of-a-kind cart", () => {
  it("never adds more than one copy of the same artwork", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      addToCart(slug);
      addToCart(slug);
    });
    expect(result.current).toEqual([{ slug, qty: 1 }]);
  });
});
