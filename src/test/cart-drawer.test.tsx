import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "@/components/CartDrawer";
import { addToCart, removeFromCart } from "@/lib/cart";
import { setCartDrawerOpen } from "@/lib/cart-drawer";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

const artwork = { slug: "drawer-test-artwork", title: "Woodland artwork", price: 250 };

afterEach(() => {
  cleanup();
  act(() => {
    setCartDrawerOpen(false);
    removeFromCart(artwork.slug);
  });
});

describe("cart drawer", () => {
  it("opens with the added artwork, closes, and reopens from the header", () => {
    render(<CartDrawer><button>Open cart</button></CartDrawer>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => addToCart(artwork));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");
    expect(screen.getByText(artwork.title)).toBeInTheDocument();
    expect(screen.getByText(/1 singular work selected/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open cart" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
