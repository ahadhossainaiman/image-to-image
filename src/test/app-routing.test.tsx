import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

const wix = vi.hoisted(() => ({
  isConfigured: vi.fn(() => false),
  getCollection: vi.fn(),
  getCollectionBySlug: vi.fn(),
  findCollections: vi.fn(),
  findProducts: vi.fn(),
  sortProductsDescending: vi.fn(),
  limitProducts: vi.fn(),
}));

vi.mock("@/lib/wix/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wix/client")>();
  const query = {
    eq: () => query,
    hasSome: () => query,
    descending: (field: string) => {
      wix.sortProductsDescending(field);
      return query;
    },
    limit: (count: number) => {
      wix.limitProducts(count);
      return query;
    },
    find: wix.findProducts,
  };
  return {
    ...actual,
    isWixConfigured: wix.isConfigured,
    ensureVisitorTokens: vi.fn(async () => undefined),
    wixClient: {
      ...actual.wixClient,
      products: { queryProducts: () => query },
      items: { query: () => ({ limit: () => ({ find: async () => ({ items: [] }) }) }) },
      currentCart: { ...actual.wixClient.currentCart, getCurrentCart: async () => ({ lineItems: [] }) },
      collections: {
        getCollection: wix.getCollection,
        getCollectionBySlug: wix.getCollectionBySlug,
        queryCollections: () => ({ limit: () => ({ find: wix.findCollections }) }),
      },
    },
  };
});

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("shows the three newest public Wix products on the homepage and refreshes the selection", async () => {
    const oldest = { slug: "oldest-art", numericId: "1" };
    const older = { slug: "older-art", numericId: "2" };
    const recent = { slug: "recent-art", numericId: "3" };
    const newest = { slug: "newest-art", numericId: "4" };
    const hidden = { slug: "hidden-art", numericId: "5", visible: false };
    const justAdded = { slug: "just-added", numericId: "6" };
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({ items: [], hasNext: () => false });
    wix.findProducts
      .mockResolvedValueOnce({
        items: [hidden, newest, recent],
        hasNext: () => true,
        next: async () => ({ items: [older, oldest], hasNext: () => false }),
      })
      .mockResolvedValueOnce({ items: [justAdded, newest, recent], hasNext: () => false });

    try {
      const history = createMemoryHistory({ initialEntries: ["/"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      await router.load();
      expect(wix.sortProductsDescending).toHaveBeenCalledWith("numericId");
      expect(wix.limitProducts).toHaveBeenCalledWith(3);
      expect(router.state.matches.at(-1)?.loaderData).toMatchObject({
        selectedWorks: [{ slug: newest.slug }, { slug: recent.slug }, { slug: older.slug }],
      });

      await router.invalidate({ sync: true });
      expect(router.state.matches.at(-1)?.loaderData).toMatchObject({
        selectedWorks: [{ slug: justAdded.slug }, { slug: newest.slug }, { slug: recent.slug }],
      });
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it("redirects old artist page links and preserves the query and anchor", async () => {
    const history = createMemoryHistory({ initialEntries: ["/about-creators?ref=menu#alba"] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });

    await router.load();

    expect(history.location.href).toBe("/about-the-artists?ref=menu#alba");
    expect(router.state.matches.at(-1)?.routeId).toBe("/about-the-artists");
  });

  it("links back to the Wix collection slug and redirects old collection ID URLs", async () => {
    const collection = {
      _id: "e738e81b-f55f-4be8-913d-afad868a2d15",
      slug: "the-mushroom-woodlands-1",
      name: "The Mushroom Woodlands",
    };
    wix.isConfigured.mockReturnValue(true);
    wix.getCollection.mockResolvedValue(collection);
    wix.getCollectionBySlug.mockClear().mockResolvedValue({ collection });
    wix.findProducts.mockResolvedValue({
      items: [{ slug: "mush-30", name: "MUSH-30", collectionIds: [collection._id] }],
    });

    try {
      const collectionPath = `/collections/${collection.slug}`;
      const history = createMemoryHistory({ initialEntries: ["/artwork/mush-30"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);

      const backLink = await screen.findByRole("link", { name: collection.name });
      expect(backLink).toHaveAttribute("href", collectionPath);
      fireEvent.click(backLink);
      await screen.findByRole("heading", { name: collection.name });
      expect(history.location.pathname).toBe(collectionPath);
      expect(wix.getCollectionBySlug).toHaveBeenCalledTimes(1);

      const oldHistory = createMemoryHistory({ initialEntries: [`/collections/${collection._id}?ref=gallery#works`] });
      const oldRouter = createRouter({ routeTree, history: oldHistory, context: { queryClient: new QueryClient() } });
      await oldRouter.load();
      expect(oldHistory.location.href).toBe(`${collectionPath}?ref=gallery#works`);
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it("shows Wix product details, compare-at pricing and media names without extensions", async () => {
    wix.isConfigured.mockReturnValue(true);
    wix.findProducts.mockResolvedValue({
      items: [{
        slug: "mush-30",
        name: "MUSH-30",
        description: "<p>Handmade &amp; embroidered.</p><p>Merino wool.</p>",
        sku: "MUSH-SKU-30",
        brand: "Woodland Atelier",
        ribbon: "New arrival",
        priceData: { price: 250, discountedPrice: 200, currency: "BDT" },
        stock: { inventoryStatus: "IN_STOCK" },
        additionalInfoSections: [{ title: "Care", description: "<p>Keep dry.</p>" }],
        productOptions: [{ name: "Size", choices: [{ description: "Small" }] }],
        customTextFields: [{ title: "Gift message" }],
        media: {
          items: [
            { title: "Mushroom Front.JPG", image: { url: "https://static.wixstatic.com/media/front.jpg", width: 1200, height: 1600, altText: "Front of the sculpture" } },
            { image: { url: "https://static.wixstatic.com/media/Mushroom%20Side.png" } },
            { title: "Studio Walkthrough.mp4", video: { files: [{ url: "https://video.wixstatic.com/studio.mp4" }] } },
          ],
        },
      }],
    });

    try {
      const history = createMemoryHistory({ initialEntries: ["/artwork/mush-30"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      const { container } = render(<RouterProvider router={router} />);

      expect(await screen.findByRole("heading", { name: "MUSH-30" })).toBeInTheDocument();
      expect(screen.getAllByText(/BDT\s*200/)).toHaveLength(2);
      expect(container.querySelector("s")).toHaveTextContent(/BDT\s*250/);
      expect(screen.getByText(/Handmade & embroidered.\s+Merino wool./)).toBeInTheDocument();
      expect(screen.getByText("Woodland Atelier")).toBeInTheDocument();
      expect(screen.getByText("MUSH-SKU-30")).toBeInTheDocument();
      expect(screen.getByText("In stock")).toBeInTheDocument();
      expect(screen.getByText("New arrival")).toBeInTheDocument();
      expect(screen.getByText("Keep dry.")).toBeInTheDocument();
      expect(screen.getByText("Small")).toBeInTheDocument();
      expect(screen.getByText("Gift message")).toBeInTheDocument();
      const cover = screen.getByRole("img", { name: "Front of the sculpture" });
      expect(cover).toHaveAttribute("fetchpriority", "high");
      const figure = cover.closest("figure")!;
      expect(figure.querySelector<HTMLDivElement>(":scope > div")?.style.aspectRatio).toBe("1200 / 1600");
      expect(screen.getByText("Mushroom Front").tagName).toBe("FIGCAPTION");
      expect(screen.getByText("Mushroom Side").tagName).toBe("FIGCAPTION");
      expect(container.querySelector("video")).toHaveAttribute("src", "https://video.wixstatic.com/studio.mp4");
      expect(screen.queryByText(/View \d+ \/ \d+/)).not.toBeInTheDocument();

      const thumbnails = within(screen.getByRole("group", { name: "Artwork media navigation" }));
      expect(thumbnails.getByText("2 photos · 1 video")).toBeInTheDocument();
      const firstThumbnail = thumbnails.getByRole("button", { name: /Show Mushroom Front/ });
      const sideThumbnail = thumbnails.getByRole("button", { name: /Show Mushroom Side/ });
      expect(within(sideThumbnail).getByAltText("")).toHaveAttribute("src", "https://static.wixstatic.com/media/Mushroom%20Side.png");
      expect(firstThumbnail).toHaveAttribute("aria-current", "true");

      const gallery = figure.parentElement!;
      const scrollTo = vi.fn();
      Object.defineProperties(gallery, {
        clientWidth: { value: 280 },
        scrollTo: { value: scrollTo },
      });
      fireEvent.click(sideThumbnail);
      expect(scrollTo).toHaveBeenCalledWith({ left: 280 });
      expect(sideThumbnail).toHaveAttribute("aria-current", "true");

      fireEvent.scroll(gallery, { target: { scrollLeft: 0 } });
      expect(firstThumbnail).toHaveAttribute("aria-current", "true");

      fireEvent.click(cover);
      const frontPreview = await screen.findByRole("dialog", { name: "Mushroom Front" });
      expect(within(frontPreview).getByRole("img")).toHaveAttribute("src", "https://static.wixstatic.com/media/front.jpg");
      fireEvent.click(within(frontPreview).getByRole("button", { name: "Close" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "View full image: Mushroom Side" }));
      const sidePreview = await screen.findByRole("dialog", { name: "Mushroom Side" });
      expect(within(sidePreview).getByRole("img")).toHaveAttribute("src", "https://static.wixstatic.com/media/Mushroom%20Side.png");
      fireEvent.keyDown(sidePreview, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it.each([
    { path: "/shop", status: "Loading shop", heading: /Singular works/ },
    { path: "/collections/the-mushroom-woodlands-1", status: "Loading collection", heading: /The Mushroom Woodlands/ },
    { path: "/artwork/mush-80", status: "Loading artwork", heading: /MUSH-80/ },
  ])("shows a loading placeholder while $path waits for Wix", async ({ path, status, heading }) => {
    let finishProducts!: () => void;
    const products = new Promise((resolve) => {
      finishProducts = () => resolve({
        items: [{ slug: "mush-80", name: "MUSH-80" }],
        hasNext: () => false,
      });
    });
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({ items: [], hasNext: () => false });
    wix.getCollectionBySlug.mockResolvedValue({
      collection: {
        _id: "e738e81b-f55f-4be8-913d-afad868a2d15",
        slug: "the-mushroom-woodlands-1",
        name: "The Mushroom Woodlands",
      },
    });
    wix.findProducts.mockReturnValueOnce(products);

    try {
      const history = createMemoryHistory({ initialEntries: [path] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);
      expect(await screen.findByText(status)).toBeInTheDocument();

      finishProducts();
      expect(await screen.findByRole("heading", { name: heading, level: 1 })).toBeInTheDocument();
      expect(screen.queryByText(status)).not.toBeInTheDocument();
    } finally {
      finishProducts();
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it.each(["/", "/shop"])("shows Wix collections in display order on %s", async (path) => {
    const names = ["The Queen Collection", "The Queen's Court", "The Queen's Kingdom", "The Mushroom Woodland"];
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({
      items: [2, 1, 0, 3].map((index) => ({ slug: `collection-${index}`, name: names[index] })),
      hasNext: () => false,
    });
    wix.findProducts.mockResolvedValue({ items: [], hasNext: () => false });

    try {
      const history = createMemoryHistory({ initialEntries: [path] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      await router.load();

      expect(router.state.matches.at(-1)?.loaderData).toMatchObject({
        categories: names.map((name) => ({ shortName: name })),
      });
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it.each(["/shop", "/collections/the-mushroom-woodlands-1"])("waits for the hover image on %s", async (path) => {
    const collection = { _id: "woodlands-id", slug: "the-mushroom-woodlands-1", name: "The Mushroom Woodland" };
    const cover = "https://static.wixstatic.com/media/cover.jpg";
    const preview = "https://static.wixstatic.com/media/preview.jpg";
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({ items: [collection], hasNext: () => false });
    wix.getCollectionBySlug.mockResolvedValue({ collection });
    wix.findProducts.mockResolvedValue({
      items: [{
        slug: "hover-art",
        name: "Hover artwork",
        collectionIds: [collection._id],
        media: { items: [cover, cover, preview].map((url) => ({ image: { url } })) },
      }],
      hasNext: () => false,
    });

    try {
      const history = createMemoryHistory({ initialEntries: [path] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);

      const card = await screen.findByRole("link", { name: "View Hover artwork" });
      const hoverImage = card.querySelector('img[aria-hidden="true"]');
      expect(hoverImage).toHaveAttribute("src", preview);
      expect(hoverImage).not.toHaveClass("group-hover:opacity-100");
      fireEvent.load(hoverImage!);
      expect(hoverImage).toHaveClass("group-hover:opacity-100");
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it("filters the shop by Wix collection membership across catalog pages", async () => {
    const kingdom = { _id: "kingdom-id", slug: "the-queens-kingdom", name: "The Queen's Kingdom" };
    const woodlands = { _id: "woodlands-id", slug: "the-mushroom-woodlands-1", name: "The Mushroom Woodlands" };
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({
      items: [kingdom],
      hasNext: () => true,
      next: async () => ({
        items: [woodlands, { _id: "hidden-id", slug: "hidden", name: "Hidden collection", visible: false }],
        hasNext: () => false,
      }),
    });
    wix.findProducts.mockResolvedValue({
      items: [{ slug: "queen-art", name: "Queen Artwork", collectionIds: [kingdom._id] }],
      hasNext: () => true,
      next: async () => ({
        items: [
          { slug: "mush-30", name: "MUSH-30", collectionIds: [kingdom._id, woodlands._id], priceData: { price: 230 } },
          { slug: "mush-31", name: "MUSH-31", collectionIds: [woodlands._id] },
        ],
        hasNext: () => false,
      }),
    });

    try {
      const history = createMemoryHistory({ initialEntries: ["/shop"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);

      const woodlandsButton = await screen.findByRole("button", { name: woodlands.name });
      expect(screen.queryByRole("button", { name: "Hidden collection" })).not.toBeInTheDocument();
      expect(screen.getByText("Showing 3 works")).toBeInTheDocument();

      fireEvent.click(woodlandsButton);
      expect(woodlandsButton).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("link", { name: "View MUSH-30" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View MUSH-31" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "View Queen Artwork" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Price on request" }));
      expect(screen.queryByRole("link", { name: "View MUSH-30" })).not.toBeInTheDocument();
      expect(screen.getByText("Showing 1 work")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All" }));
      fireEvent.click(screen.getByRole("button", { name: kingdom.name }));
      expect(screen.getByRole("link", { name: "View MUSH-30" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View Queen Artwork" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "View MUSH-31" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All works" }));
      expect(screen.getByText("Showing 3 works")).toBeInTheDocument();
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it("filters the local shop by collection slug when Wix is unconfigured", async () => {
    const history = createMemoryHistory({ initialEntries: ["/shop"] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole("button", { name: "Merino Sculptures" }));
    expect(screen.getByRole("link", { name: /View Meadow Mushrooms/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View Celestial Angel/ })).not.toBeInTheDocument();
  });
});
