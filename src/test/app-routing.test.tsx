import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId, RouterProvider } from "@tanstack/react-router";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

const wix = vi.hoisted(() => ({
  isConfigured: vi.fn(() => false),
  getCollection: vi.fn(),
  getCollectionBySlug: vi.fn(),
  findCollections: vi.fn(),
  findProducts: vi.fn(),
  queryProductVariants: vi.fn(),
  addToCurrentCart: vi.fn(),
  removeLineItemsFromCurrentCart: vi.fn(),
  getCurrentCart: vi.fn(async () => ({ lineItems: [] as unknown[] })),
  createCheckoutFromCurrentCart: vi.fn(),
  createRedirectSession: vi.fn(),
}));

vi.mock("@/lib/wix/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wix/client")>();
  const query = {
    eq: () => query,
    hasSome: () => query,
    descending: () => query,
    limit: () => query,
    find: wix.findProducts,
  };
  return {
    ...actual,
    isWixConfigured: wix.isConfigured,
    ensureVisitorTokens: vi.fn(async () => undefined),
    wixClient: {
      ...actual.wixClient,
      products: { queryProducts: () => query, queryProductVariants: wix.queryProductVariants },
      items: { query: () => ({ limit: () => ({ find: async () => ({ items: [] }) }) }) },
      currentCart: {
        ...actual.wixClient.currentCart,
        getCurrentCart: wix.getCurrentCart,
        addToCurrentCart: wix.addToCurrentCart,
        removeLineItemsFromCurrentCart: wix.removeLineItemsFromCurrentCart,
        createCheckoutFromCurrentCart: wix.createCheckoutFromCurrentCart,
      },
      redirects: { createRedirectSession: wix.createRedirectSession },
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
    { path: "/", name: "Bespoke enquiry" },
    { path: "/", name: "Contact us" },
    { path: "/collections/woodland", name: "Bespoke enquiry" },
    { path: "/artwork/woodland-art", name: "Bespoke enquiry", piece: "Woodland Art" },
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
    if (name === "Contact us") expect(links).toHaveLength(1);
    for (const link of links) {
      const destination = new URL(link.getAttribute("href")!, window.location.origin);
      expect(destination.pathname).toBe("/contact");
      expect(destination.searchParams.get("piece")).toBe(piece ?? null);
    }
    fireEvent.click(links[0]!);

    expect(await screen.findByRole("heading", { name: "Prepare your enquiry" })).toBeInTheDocument();
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
      const selectedWorks = within(await screen.findByRole("region", { name: "From the Atelier" }));
      expect(selectedWorks.queryByRole("article")).not.toBeInTheDocument();
      expect(selectedWorks.getByText(/creative workspace or studio/)).toBeInTheDocument();
      const navigation = within(screen.getByRole("navigation", { name: "Main navigation" }));
      expect(navigation.getByRole("link", { name: "Bespoke enquiry" })).toHaveAttribute("href", "/contact");
      fireEvent.click(selectedWorks.getByRole("link", { name: "View all works" }));
      expect(await screen.findByRole("link", { name: "View Gallery Work" })).toBeInTheDocument();
      expect(history.location.pathname).toBe("/shop");
    } finally {
      wix.isConfigured.mockReturnValue(false);
    }
  });

  it("preserves the BDT price and re-enables checkout after a redirect, an error, or browser Back", async () => {
    const product = {
      _id: "7a407a0e-291f-4a01-9f33-018ef6678cb4",
      slug: "woodland-cart-test",
      name: "Woodland Cart Test",
      sku: "MUSH110",
      description: "<p>Handmade in the atelier.</p>",
      productType: "physical",
      stock: { inventoryStatus: "IN_STOCK" },
      priceData: { price: 280, discountedPrice: 280, currency: "BDT" },
      priceRange: { minValue: 280, maxValue: 350 },
    };
    wix.isConfigured.mockReturnValue(true);
    wix.findProducts.mockResolvedValue({ items: [product], hasNext: () => false });
    const serverCart = { currency: "BDT", lineItems: [{ _id: "cart-line", catalogReference: { catalogItemId: product._id }, price: { amount: "280" } }] };
    wix.addToCurrentCart.mockReset().mockResolvedValue({ cart: serverCart });
    wix.removeLineItemsFromCurrentCart.mockResolvedValue({});

    const history = createMemoryHistory({ initialEntries: [`/artwork/${product.slug}`] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
    const { container } = render(<RouterProvider router={router} />);
    await screen.findByRole("heading", { name: product.name });
    const details = within(container.querySelector("main aside")!);
    expect(details.getByText(/BDT\s*280/)).toBeInTheDocument();
    expect(details.getByText("MUSH110")).toBeInTheDocument();
    expect(details.getByText("Physical")).toBeInTheDocument();
    expect(details.getByText("Handmade in the atelier.")).toBeInTheDocument();
    expect(details.queryByText(/Regular price|Variant prices|Package dimensions|Quantity in stock|Net quantity|Weight/)).not.toBeInTheDocument();
    fireEvent.click(details.getByRole("button", { name: "Add to cart" }));

    const drawer = within(await screen.findByRole("dialog"));
    expect(drawer.getByText(product.name)).toBeInTheDocument();
    expect(drawer.getByText(/BDT\s*280/)).toBeInTheDocument();
    expect(wix.addToCurrentCart).toHaveBeenCalledTimes(1);
    expect(wix.addToCurrentCart).toHaveBeenCalledWith({
      lineItems: [{ quantity: 1, catalogReference: { appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e", catalogItemId: product._id } }],
    });
    fireEvent.click(drawer.getByRole("link", { name: "Review your selection" }));
    const checkoutButton = await screen.findByRole("button", { name: "Proceed to secure checkout" });
    expect(checkoutButton).toBeEnabled();
    expect(screen.getByText("Subtotal (BDT)")).toBeInTheDocument();

    wix.getCurrentCart.mockResolvedValue(serverCart);
    wix.createCheckoutFromCurrentCart.mockResolvedValue({ checkoutId: "checkout" });
    wix.createRedirectSession.mockResolvedValueOnce({ redirectSession: { fullUrl: "#wix-checkout-test" } });
    fireEvent.click(checkoutButton);
    expect(checkoutButton).toBeDisabled();
    expect(await screen.findByRole("button", { name: "Proceed to secure checkout" })).toBeEnabled();
    expect(wix.createRedirectSession).toHaveBeenCalledTimes(1);

    wix.createRedirectSession.mockResolvedValueOnce({});
    fireEvent.click(checkoutButton);
    expect(await screen.findByRole("alert")).toHaveTextContent("No redirect URL returned by Wix Headless.");
    expect(checkoutButton).toBeEnabled();

    let finishCheckout: (result: { checkoutId: string }) => void = () => {};
    wix.createCheckoutFromCurrentCart.mockReturnValueOnce(new Promise((resolve) => { finishCheckout = resolve; }));
    fireEvent.click(checkoutButton);
    expect(checkoutButton).toBeDisabled();
    const pageShow = new Event("pageshow");
    Object.defineProperty(pageShow, "persisted", { value: true });
    fireEvent(window, pageShow);
    expect(checkoutButton).toBeEnabled();
    wix.createRedirectSession.mockResolvedValueOnce({ redirectSession: { fullUrl: "#wix-checkout-test" } });
    await act(async () => finishCheckout({ checkoutId: "checkout" }));

    fireEvent.click(screen.getByRole("button", { name: /Remove/ }));
    expect(await screen.findByText("Your gallery awaits.")).toBeInTheDocument();
    wix.getCurrentCart.mockResolvedValue({ lineItems: [] });
    window.history.replaceState(null, "", window.location.pathname);
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

  it.each(["/shop", "/collections/the-mushroom-woodlands-1"])("orders Mushroom works by item number on %s", async (path) => {
    const collection = {
      _id: "e738e81b-f55f-4be8-913d-afad868a2d15",
      slug: "the-mushroom-woodlands-1",
      name: "The Mushroom Woodlands",
    };
    wix.isConfigured.mockReturnValue(true);
    wix.findCollections.mockResolvedValue({ items: [collection], hasNext: () => false });
    wix.getCollectionBySlug.mockResolvedValue({ collection });
    wix.findProducts.mockResolvedValue({
      items: [
        { slug: "mush-120", name: "MUSH-120" },
        { slug: "queen", name: "The Queen" },
        { slug: "mush-100", name: "MUSH-100" },
        { slug: "mush-40", name: "MUSH-40" },
        { slug: "mush-30", name: "The Bordeaux Countryside" },
      ],
      hasNext: () => false,
    });
    const history = createMemoryHistory({ initialEntries: [path] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
    render(<RouterProvider router={router} />);
    const links = await screen.findAllByRole("link", { name: /^View / });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/artwork/mush-30", "/artwork/queen", "/artwork/mush-40", "/artwork/mush-100", "/artwork/mush-120",
    ]);
  });

  it("shows populated Wix product fields, extra prices and media names without extensions", async () => {
    wix.isConfigured.mockReturnValue(true);
    const productId = "5e1a40ed-c6f4-4951-80bd-b317d354ff31";
    wix.queryProductVariants.mockResolvedValue({
      variants: [
        { choices: { Size: "Small" }, variant: { priceData: { price: 175, currency: "USD" }, sku: "MUSH-S" }, stock: { trackQuantity: true, quantity: 0 } },
        { choices: { Size: "Large" }, variant: { priceData: { price: 275, discountedPrice: 225, currency: "USD" } } },
        { choices: { Size: "Hidden" }, variant: { visible: false, priceData: { price: 900, currency: "USD" } } },
      ],
      totalResults: 3,
    });
    wix.findProducts.mockResolvedValue({
      items: [{
        _id: productId,
        slug: "mush-30",
        name: "MUSH-30",
        description: '<p><span style="font-weight: 700">Handmade &amp; embroidered.</span></p><p>Merino wool.</p>',
        sku: "MUSH-SKU-30",
        brand: "Woodland Atelier",
        ribbon: "New arrival",
        priceData: { price: 250, discountedPrice: 200, currency: "USD", pricePerUnit: 40 },
        pricePerUnitData: { totalQuantity: 500, totalMeasurementUnit: "G", baseQuantity: 100, baseMeasurementUnit: "G" },
        packageDimensions: { length: "30", width: "20", unit: "CM" },
        stock: { inventoryStatus: "IN_STOCK" },
        additionalInfoSections: [{ title: "Care", description: '<ul><li>Keep dry.</li></ul><p><a href="javascript:alert(1)">Care guide</a></p>' }],
        manageVariants: true,
        productOptions: [{ name: "Size", choices: [{ description: "Small" }, { description: "Large" }, { description: "Hidden", visible: false }] }],
        customTextFields: [{ title: "Gift message", mandatory: true, maxLength: 50 }],
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
      expect(screen.getByText("$200")).toBeInTheDocument();
      expect(screen.getByText("$250").closest("s")).toBeInTheDocument();
      expect(screen.getByText("$40 / 100 g")).toBeInTheDocument();
      expect(screen.getByText("500 g")).toBeInTheDocument();
      expect(screen.getByText("L 30 cm × W 20 cm")).toBeInTheDocument();
      expect(wix.queryProductVariants).toHaveBeenCalledWith(productId, { paging: { limit: 100, offset: 0 } });
      expect(screen.getByText("Variant prices $175–$225")).toBeInTheDocument();
      expect(screen.getByText("$275")).toBeInTheDocument();
      expect(screen.getByText("MUSH-S")).toBeInTheDocument();
      expect(screen.getByText("Out of stock")).toBeInTheDocument();
      expect(within(screen.getByRole("main")).getByText("0")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Open shopping cart with 0 items" })).toHaveTextContent("0");
      expect(screen.queryByText(/\$900|Size: Hidden/)).not.toBeInTheDocument();
      const description = within(screen.getByRole("region", { name: "About this work" }));
      expect(description.getByText("Handmade & embroidered.").tagName).toBe("STRONG");
      expect(description.getByText("Merino wool.").tagName).toBe("P");
      expect(screen.getByText("Woodland Atelier")).toBeInTheDocument();
      expect(screen.getByText("MUSH-SKU-30")).toBeInTheDocument();
      expect(screen.getByText("In stock")).toBeInTheDocument();
      expect(screen.getByText("New arrival")).toBeInTheDocument();
      expect(screen.getByText("Keep dry.").tagName).toBe("LI");
      expect(screen.getByText("Care guide").closest("a")).toBeNull();
      expect(screen.getByText("Small, Large")).toBeInTheDocument();
      expect(screen.getByText("Gift message")).toBeInTheDocument();
      expect(screen.getByText(/Up to 50 characters/)).toBeInTheDocument();
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
          { slug: "mush-30", name: "MUSH-30", collectionIds: [kingdom._id, woodlands._id], priceData: { price: 230, currency: "BDT" } },
          { slug: "mush-31", name: "MUSH-31", collectionIds: [woodlands._id] },
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
      expect(pricedCard.getByRole("heading", { name: "MUSH-30" }).previousElementSibling).toHaveTextContent(/BDT\s*230/);
      expect(inquiryCard.queryByText(/280/)).not.toBeInTheDocument();
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

  it("shows no demo products or collection options when Wix is unconfigured", async () => {
    const history = createMemoryHistory({ initialEntries: ["/shop"] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Showing 0 works")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    const filters = within(screen.getByRole("region", { name: "Gallery filters" }));
    expect(filters.getAllByRole("button")).toHaveLength(4);
  });
});
