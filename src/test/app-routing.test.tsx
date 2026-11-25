import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

const wix = vi.hoisted(() => ({
  isConfigured: vi.fn(() => false),
  getCollection: vi.fn(),
  getCollectionBySlug: vi.fn(),
  findCollections: vi.fn(),
  findProducts: vi.fn(),
}));

vi.mock("@/lib/wix/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wix/client")>();
  const query = {
    eq: () => query,
    hasSome: () => query,
    limit: () => query,
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
  afterEach(() => wix.isConfigured.mockReturnValue(false));

  it.each([
    { path: "/", name: "Bespoke inquiry" },
    { path: "/", name: "Begin a bespoke inquiry" },
    { path: "/", name: "Contact Us" },
    { path: "/collections/woodland", name: "Bespoke inquiry" },
    { path: "/artwork/woodland-art", name: "Bespoke inquiry", piece: "Woodland Art" },
    { path: "/artwork/woodland-art", name: "Acquire artwork", piece: "Woodland Art" },
  ])("opens the contact page directly from $name on $path", async ({ path, name, piece }) => {
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({ items: [], hasNext: () => false });
    wix.getCollectionBySlug.mockResolvedValue({ collection: { slug: "woodland", name: "Woodland" } });
    wix.findProducts.mockResolvedValue({ items: [{ slug: "woodland-art", name: "Woodland Art" }], hasNext: () => false });
    const history = createMemoryHistory({ initialEntries: [path] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
    const { container } = render(<RouterProvider router={router} />);

    const main = within(await screen.findByRole("main"));
    const links = await main.findAllByRole("link", { name });
    for (const link of links) {
      const destination = new URL(link.getAttribute("href")!, window.location.origin);
      expect(destination.pathname).toBe("/contact");
      expect(destination.searchParams.get("piece")).toBe(piece ?? null);
    }
    fireEvent.click(links[0]!);

    expect(await screen.findByRole("heading", { name: "Prepare your inquiry" })).toBeInTheDocument();
    expect(history.location.pathname).toBe("/contact");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    if (piece) expect(container.querySelector('input[name="piece"]')).toHaveValue(piece);
  });

  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("links Atelier to the full catalog without fetching product cards for the homepage", async () => {
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({ items: [], hasNext: () => false });
    wix.findProducts.mockClear().mockResolvedValue({ items: [{ slug: "gallery-work", name: "Gallery Work" }], hasNext: () => false });

    try {
      const history = createMemoryHistory({ initialEntries: ["/"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);
      const selectedWorks = await screen.findByRole("region", { name: "Atelier" });
      expect(within(selectedWorks).getByRole("heading", { name: "Atelier" })).toBeInTheDocument();
      expect(within(selectedWorks).queryByRole("img")).not.toBeInTheDocument();
      expect(wix.findProducts).not.toHaveBeenCalled();
      const navigation = within(screen.getByRole("navigation", { name: "Main navigation" }));
      expect(navigation.getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/contact");
      fireEvent.click(within(selectedWorks).getByRole("link", { name: "View All Works" }));
      expect(await screen.findByRole("link", { name: "View Gallery Work" })).toBeInTheDocument();
      expect(history.location.pathname).toBe("/shop");
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
      hasNext: () => false,
    });

    try {
      const collectionPath = `/collections/${collection.slug}`;
      const history = createMemoryHistory({ initialEntries: ["/artwork/mush-30"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);

      const backLink = await screen.findByRole("link", { name: "The Mushroom Woodland" });
      expect(backLink).toHaveAttribute("href", collectionPath);
      fireEvent.click(backLink);
      await screen.findByRole("heading", { name: "The Mushroom Woodland" });
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

  it("shows Wix product details, regular USD pricing and media names without extensions", async () => {
    wix.isConfigured.mockReturnValue(true);
    wix.findProducts.mockResolvedValue({
      items: [{
        slug: "mush-30",
        name: "MUSH-30",
        description: "<p>Handmade &amp; embroidered.</p><p>Merino wool.</p>",
        sku: "MUSH-SKU-30",
        brand: "Woodland Atelier",
        ribbon: "New arrival",
        priceData: { price: 250, discountedPrice: 200, currency: "USD" },
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
      expect(screen.getAllByText("$250")).toHaveLength(2);
      expect(screen.queryByText("$200")).not.toBeInTheDocument();
      expect(container.querySelector("s")).not.toBeInTheDocument();
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
      const previewImage = within(frontPreview).getByRole("img");
      expect(previewImage).toHaveAttribute("src", "https://static.wixstatic.com/media/front.jpg");
      const zoomOut = within(frontPreview).getByRole("button", { name: "Zoom out" });
      expect(zoomOut).toBeDisabled();
      fireEvent.click(within(frontPreview).getByRole("button", { name: "Zoom in" }));
      expect(previewImage).toHaveStyle({ transform: "translate(0px, 0px) scale(1.5)" });
      fireEvent.click(zoomOut);
      expect(previewImage).toHaveStyle({ transform: "translate(0px, 0px) scale(1)" });
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
    { path: "/collections/the-mushroom-woodlands-1", status: "Loading collection", heading: /The Mushroom Woodland$/ },
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
    const names = ["The Queen Collection", "The Queen's Court", "The Queen's Kingdom", "The Mushroom Woodland", "#5", "#6", "Other collection"];
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({
      items: [5, 6, 2, 3, 1, 4, 0].map((index) => ({ slug: `collection-${index}`, name: index === 3 ? "The Mushroom Woodlands" : names[index] })),
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

  it.each(["/shop", "/collections/the-mushroom-woodlands-1"])("loads the hover image and opens artwork details when the card image is clicked on %s", async (path) => {
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
      expect(card).toHaveAttribute("href", "/artwork/hover-art");
      fireEvent.click(within(card).getByRole("img"));
      expect(await screen.findByRole("heading", { name: "Hover artwork", level: 1 })).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(history.location.pathname).toBe("/artwork/hover-art");
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
          { slug: "mush-30", name: "MUSH-30", collectionIds: [kingdom._id, woodlands._id], priceData: { price: 230, currency: "USD" } },
          { slug: "mush-31", name: "MUSH-31", collectionIds: [woodlands._id], priceData: { price: 280, currency: "BDT" } },
        ],
        hasNext: () => false,
      }),
    });

    try {
      const history = createMemoryHistory({ initialEntries: ["/shop"] });
      const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
      render(<RouterProvider router={router} />);

      const woodlandsButton = await screen.findByRole("button", { name: "The Mushroom Woodland" });
      expect(screen.queryByRole("button", { name: "Hidden collection" })).not.toBeInTheDocument();
      expect(screen.getByText("Showing 3 works")).toBeInTheDocument();

      fireEvent.click(woodlandsButton);
      expect(woodlandsButton).toHaveAttribute("aria-pressed", "true");
      const pricedCard = within(screen.getByRole("link", { name: "View MUSH-30" }));
      const inquiryCard = within(screen.getByRole("link", { name: "View MUSH-31" }));
      expect(pricedCard.getByRole("heading", { name: "MUSH-30" }).previousElementSibling).toHaveTextContent("$230");
      expect(inquiryCard.getByRole("heading", { name: "MUSH-31" }).previousElementSibling).toBeNull();
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

      const collectionSelect = screen.getByRole("combobox", { name: "Collection" });
      const availabilitySelect = screen.getByRole("combobox", { name: "Availability" });
      expect(within(collectionSelect).queryByRole("option", { name: "Hidden collection" })).not.toBeInTheDocument();

      fireEvent.change(collectionSelect, { target: { value: woodlands.slug } });
      fireEvent.change(availabilitySelect, { target: { value: "request" } });
      expect(screen.getByRole("link", { name: "View MUSH-31" })).toBeInTheDocument();
      expect(screen.getByText("Showing 1 work")).toBeInTheDocument();
      expect(woodlandsButton).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "Price on request" })).toHaveAttribute("aria-pressed", "true");

      fireEvent.change(collectionSelect, { target: { value: "" } });
      fireEvent.change(availabilitySelect, { target: { value: "all" } });
      expect(screen.getByText("Showing 3 works")).toBeInTheDocument();
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it("shows no demo products or collection options when Wix is unconfigured", async () => {
    const history = createMemoryHistory({ initialEntries: ["/shop"] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Showing 0 works")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(within(screen.getByRole("combobox", { name: "Collection" })).getAllByRole("option")).toHaveLength(1);
  });
});
